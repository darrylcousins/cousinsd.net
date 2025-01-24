
import fs from 'node:fs';
import crypto from 'node:crypto';
import Logger from '../lib/logger.js';
import Mongo from '../lib/mongo.js';
import Signature from '../lib/signature.js';
import Request from './request.js';
import Response from './response.js';

class Server {

  request = null;
  response = null;
  logger = null;
  mongo = null;
  domain = null;
  host = null;
  actor = null;
  closed = false;

  constructor(domain, name, mongo_uri) {
    this.domain = domain;
    this.host = `https://${this.domain}`;
    this.actor = `${this.host}/${name}`;
    this.request = new Request();
    this.response = new Response();
    this.mongo = new Mongo(mongo_uri);
    this.signature = new Signature();
    this.logger = new Logger({ ...this.request.server, ...this.request.headers });

    /* node:coverage disable */
    if (parseInt(process.env.DEBUG) === 1) {
      for (let name in process.env) {
        this.logger.app(`${name}: ${process.env[name]}`);
      }
    }
    /* node:coverage enable */
    this.logger.app('Server constructor has run');
  }

  async close(status) {
    if (this.closed) return;
    this.closed = true;
    if (status) { // record any rejections
      await this.logger.app(`rejected request: ${status}`);
    }
    await this.mongo.close(); // close mongo connection
    this.logger.close(); // close any open file handles
    this.response.end(status); // sends headers if not sent
  }

  async error(e) {
    const parts = e.stack.split('\n');
    const errString = `${parts[0]}\n${parts[1]}\n${parts[2]}`;
    this.logger.error(errString);
    await this.close('500 Server Error');
  }

  /*
  // TODO Not sending accept now, instead we store it for later acceptance
  // TODO this goes into the accept routine
  async accept({ actor, data, reqBody }) {
    const guid = crypto.randomBytes(16).toString('hex');
    const message = {
      "@context": "https://www.w3.org/ns/activitystreams",
      "id": `${this.actor}/messages/${guid}`,
      "type": "Accept",
      "actor": `${data.object}`,
      "object": `${reqBody}`
    }
    const doc = { ...message, object: data, id: `${guid}` };
    // save the message in full as a JSON object
    // why? Surely we save the original Follow to 'inbox' for action later
    // or just save it as a record of actions performed?
    await this.mongo.insertOne('messages', doc);

    // create signed headers and send accept message
    const keys = await this.mongo.findOne('keys', {id: this.actor});
    const headers = this.signature.headers({ 
      inbox: actor.inbox,
      reqBody: JSON.stringify(message),
      privateKey: keys.privateKey,
      keyId: keys.keyId
    });
    this.logger("HEADERS:");
    this.logger(headers);
    this.logger("END HEADERS:");
    const result = await fetch(actor.inbox, {
      headers,
      method: 'POST',
      accept: 'application/activity+json',
      body: JSON.stringify(message)
    }).then(response => response.json());
    this.logger.app(result);
  }
  */

  async readBody(stream) {
    return new Promise((resolve, reject) => {
      let reqBody = '';
      stream.on("data", (chunk) => {
        reqBody += chunk;
      });
      stream.on('end', async () => {
        resolve(reqBody);
      });
    });
  }

  /* activitypub data should have @context,
   * should have a type attribute
   * object should match our actor
   */
  verifyData(data) {
    if (!Object.keys(data).includes('@context')) return false
    if (!Object.keys(data).includes('type')) return false
    if (!Object.keys(data).includes('object')) return false
    if (!Object.keys(data).includes('actor')) return false
    if (data.object !== this.actor) return false;
    return true;
  }

  async run() {
    this.logger.app(`running ${this.request.filename}`);
    if (this.request.filename !== 'inbox' && this.request.method !== 'GET') {
      this.close('400 Bad Request - Wrong Method');
      return;
    }
    switch (this.request.filename) {
      case 'index':
        this.response.write(await this.mongo.findOne('actors', {
          id: this.actor
        }));
        this.close(); 
        break;
      case 'profile':
        this.response.write(await this.mongo.findOne('profiles', {
          actor: this.actor
        }));
        this.close(); 
        break;
      case 'followers':
        this.response.write(await this.mongo.findOne('followers', {
          actor: this.actor
        }));
        this.close(); 
        break;
      case 'following':
        this.response.write(await this.mongo.findOne('following', {
          actor: this.actor
        }));
        this.close(); 
        break;
      case 'publickey':
        const account = await this.mongo.findOne('actors', {
          id: this.actor
        });
        this.response.write(account.publicKey);
        this.close(); 
        break;
      case 'inbox':
        if (this.request.method !== 'POST') {
          this.close('400 Bad Request - No Post');
          return;
        }
        let reqBody = '';
        let data;
        let valid;
        let actor;

        reqBody = await this.readBody(process.stdin);

        if (reqBody.length === 0) {
          this.close('400 Bad Request - No Data');
          return;
        } else {
          try {
            data = JSON.parse(reqBody);
            this.logger.app(data);
            this.logger.app(this.request.headers);
          } catch(e) {
            this.close('400 Bad Request - Not JSON Data');
            return;
          }
          if (!this.verifyData(data)) {
            this.close('400 Bad Request - Not ActivityPub Data');
            return;
          }
          try {
            actor = await fetch(data.actor, {
              method: 'GET',
              headers: {
                accept: 'application/activity+json'
              }
            }).then(response => response.json());
          } catch(e) {
            const parts = e.stack.split('\n');
            const errString = `${parts[0]}\n${parts[1]}\n${parts[2]}`;
            this.logger.error(errString);
            this.close('406 Not Acceptable - Unable to Fetch Actor');
            return;
          }
          // validate the request
          const fields = {};
          for (const pair of this.request.headers.signature.split(',')) {
            fields[pair.substring(0, pair.indexOf('='))] = pair.substring(pair.indexOf('=') + 2, pair.length - 1);
          }
          try {
            valid = this.signature.validate({ 
              path: this.request.url.pathname,
              reqBody, 
              headers: this.request.headers,
              publicKey: actor.publicKey.publicKeyPem
            });
          /* node:coverage disable */
          } catch(e) {
            this.error(e);
            return;
          }
          /* node:coverage enable */
          if (!valid) {
            this.logger.app('Signature validation failed');
            this.close('401 Signature Validation Failed');
            return;
          } else {
            this.logger.app('Signature validation passed');
            // once validation has passed then store and message self that something needs action
            // for follows we need to send accept
            // for creates then that needs to be worked out
            try {
              const guid = crypto.randomBytes(16).toString('hex');
              await this.mongo.insertOne('inbox', {
                id: `${guid}`,
                actor: {id: actor.id, inbox: actor.inbox },
                data,
                body: reqBody,
                inserted: new Date(),
                updated: new Date() // in case
              });
            /* node:coverage disable */
            } catch(e) {
              this.error(e);
              return;
            }
            /* node:coverage enable */
          }
        }
        this.close(); 
        break;
      default:
        this.response.write(await this.mongo.findOne('actors', {
          id: this.actor
        }));
        this.close(); 
        break;
    }
  }
}

export default Server;

