
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

  constructor(domain, name, mongo_uri) {
    this.domain = domain;
    this.host = `https://${this.domain}`;
    this.actor = `${this.host}/${name}`;
    this.request = new Request();
    this.response = new Response();
    this.mongo = new Mongo(mongo_uri);
    this.signature = new Signature();
    this.logger = new Logger({ ...this.request.server, ...this.request.headers });
    for (let name in process.env) {
      this.logger.access(`${name}: ${process.env[name]}`);
    }
    this.logger.access(this.actor);
  }

  async close(status) {
    await this.mongo.close();
    this.response.end(status); // sends headers if not sent
    process.exit();
  }

  async error(e) {
    const parts = e.stack.split('\n');
    const errString = `${parts[0]}\n${parts[1]}\n${parts[2]}`;
    this.logger.error(errString);
    this.close('500 Server Error');
  }

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
    this.logger.access(result);
  }

  async run() {
    this.logger.access(`running ${this.request.filename}`);
    switch (this.request.filename) {
      case 'index':
        this.response.write(await this.mongo.findOne('actors', {
          id: this.actor
        }));
        break;
      case 'profile':
        this.response.write(await this.mongo.findOne('profiles', {
          actor: this.actor
        }));
        break;
      case 'followers':
        this.response.write(await this.mongo.findOne('followers', {
          actor: this.actor
        }));
        break;
      case 'following':
        this.response.write(await this.mongo.findOne('following', {
          actor: this.actor
        }));
        break;
      case 'publickey':
        const account = await this.mongo.findOne('actors', {
          id: this.actor
        });
        this.response.write(account.publicKey);
        break;
      case 'inbox':
        let reqBody = "";
        let data;
        let valid;
        let actor;
        try {
          reqBody = fs.readFileSync(process.stdin.fd, 'utf-8');
        } catch(e) {
          this.error(e);
        }
        if (!reqBody.length) {
          this.response.write('{}');
          this.close('400 Bad Request');
        } else {
          try {
            data = JSON.parse(reqBody);
            this.logger.access(data);
            this.logger.access(this.request.headers);
          } catch(e) {
            this.error(e);
          }
          // get the actors publicKey
          actor = await fetch(data.actor, {
            method: 'GET',
            headers: {
              accept: 'application/activity+json'
            }
          }).then(response => response.json());
          // validate the request
          const fields = {};
          for (const pair of this.request.headers.signature.split(',')) {
            fields[pair.substring(0, pair.indexOf('='))] = pair.substring(pair.indexOf('=') + 2, pair.length - 1);
          }
          this.logger.access("=======================");
          this.logger.access("Fields:");
          this.logger.access(fields);
          this.logger.access("=======================");
          this.logger.access("pathname:");
          this.logger.access(this.request.url.pathname);
          this.logger.access("=======================");
          this.logger.access("headers:");
          this.logger.access(this.request.headers);
          this.logger.access("=======================");
          this.logger.access("body:");
          this.logger.access(reqBody);
          try {
            valid = this.signature.validate({ 
              path: this.request.url.pathname,
              reqBody, 
              headers: this.request.headers,
              publicKey: actor.publicKey.publicKeyPem
            });
          } catch(e) {
            this.error(e);
          }
          if (!valid) {
            this.logger.access('Signature validation failed');
            this.close('401 Signature Validation Failed');
          } else {
            this.logger.access('Signature validation passed');
            switch (data.type) {
              case 'Create':
                this.logger.access(`Type: ${data.type} ${data.object.type}`);
                break;
              case 'Follow': // same with 'Undo' but the object will the original 'Follow' request
                this.logger.access(`Type: ${data.type} ${data.object}`);
                try {
                  // use a new process so that 200 is returned
                  // OR store in inbox collection for approval later in which case we only need to following:
                  // 2 objects and a string, and a timestamp
                  // Give it a guid and on processing save that as part of the messages
                  // Can get by db.collection("inbox").findOne({data.type: "Follow"})
                  //
                  // this is never run
                  // save the message in full as a JSON object
                  // why? Surely we save the original Follow to 'inbox' for action later
                  // or just save it as a record of actions performed?
                  // only need actor inbox, but save id as well
                  const guid = crypto.randomBytes(16).toString('hex');
                  await this.mongo.insertOne('inbox', {
                    id: `${guid}`,
                    actor: {id: actor.id, inbox: actor.inbox },
                    data,
                    body: reqBody,
                    inserted: new Date(),
                    updated: new Date() // in case
                  });
                  //this.accept({ actor, data, reqBody });
                } catch(e) {
                  this.error(e);
                }
                break;
              default:
                this.logger.access(`Not implemented: ${data.type}`);
                this.close('501 Not Implemented');
                break;
            }
          }
        }
        break;
      default:
        this.response.write(await this.mongo.findOne('actors', {
          id: this.actor
        }));
        break;
    }
  }
}

export default Server;

