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
  content_type = 'json';

  constructor(domain, name) {
    this.domain = process.env.DOMAIN;
    this.host = `https://${this.domain}`;
    this.actor = `${this.host}/${process.env.NAME}`;
    this.request = new Request();
    this.response = new Response();
    this.mongo = new Mongo(process.env.MONGO_URI);
    this.signature = new Signature();
    this.logger = new Logger({ ...this.request.server, ...this.request.headers });
    if (this.request.headers.accept.includes('html')) {
      this.response.setContentType('text/html; charset=utf-8');
      this.content_type = 'html';
    } else if (this.request.headers.accept.includes('json')) {
      this.response.setContentType('application/json');
      this.content_type = 'json';
    } else {
      // XXX if no accept header then reject request!
    }

    /* node:coverage disable */
    if (parseInt(process.env.DEBUG) === 1) {
      for (let name in process.env) {
        if (name.startsWith('HTTP')) {
          this.logger.app(`${name}: ${process.env[name]}`);
        }
      }
    }
    /* node:coverage enable */
    this.logger.app('Server constructor has run');
  }

  async close(status) {
    if (this.closed) return;
    this.closed = true;
    if (status === 404) {
      this.response.setStatus(`${status} Not Found`);
      this.response.setContentType('text/html; charset=utf-8');
      await import('../routes/404.js')
        .then(async ({ default: fn }) => await fn(this.request, this.response));
      return;
    }
    if (status) { // record any rejections
      this.logger.app(`rejected request: ${status}`);
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
   */
  verifyData(data) {
    if (!Object.keys(data).includes('@context')) return false
    if (!Object.keys(data).includes('object')) return false
    if (!Object.keys(data).includes('actor')) return false
    if (!Object.keys(data).includes('type')) return false
    return true;
  }

  failPost({status, error, actor, body}) {
    this.logger.app(error);
    this.response.setStatus(`${status} ${error}`);
    this.response.write({
      error,
      actor,
      body
    });
    this.close();
  }

  async run() {
    this.logger.app(`running ${this.request.filename}`);
    const match = this.request.filename.match(/\.(js|css)$/) ;
    if (Boolean(match)) {
      let filetype;
      if (match[1] === 'css') {
        filetype = 'text/css';
      } else if (match[1] === 'js') {
        filetype = 'text/javascript';
      }
      this.response.setContentType(`${filetype}; charset=utf-8`);
      this.response.write(fs.readFileSync(`${process.env.ASSETS_PATH}/${this.request.filename}`, { encoding: 'utf8', flag: 'r' }));
      this.close();
      return;
    }
    if (this.request.filename !== 'inbox' && this.request.method !== 'GET') {
      this.close('400 Bad Request - Wrong Method');
      return;
    }
    let opts = {
      actor: this.actor,
      mongo: this.mongo,
      filename: this.request.filename,
      content_type: this.content_type
    };

    if (this.request.method === 'GET') {
      if (!['index', 'inbox', 'outbox', 'profile', 'followers', 'following', ''].includes(this.request.filename)) {
        this.close(404);
        return;
      }
      try {
        await import('../routes/main.js')
          .then(async ({ default: fn }) => await fn(this.request, this.response, opts));
      } catch(e) {
        this.error(e);
        return;
      } finally {
        this.close(); 
        return;
      }
    } else if (this.request.filename !== 'inbox') {
      this.close(404);
      return;
    } else {
      if (this.request.method !== 'POST') {
        this.close('400 Bad Request - No Post');
        return;
      }

      let reqBody = '';
      let data;
      let valid;
      let actor;
      let errorMessage;

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
          this.failPost({
            status: '406',
            error: 'Not Acceptable - Unable to Fetch Actor',
            actor: data.actor,
            body: reqBody
          });
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
          errorMessage = 'Signature Validation Failed';
          this.logger.app(errorMessage);
          // might be polite to send JSON data with error
          this.response.setStatus(`401 ${errorMessage}`);
          this.response.write({
            error: errorMessage,
            actor: data.actor,
            body: reqBody
          });
          this.close();
          return;
        } else {
          this.logger.app('Signature validation passed');
          // once validation has passed then store and message self that something needs action
          // for follows we need to send accept
          // for creates then that needs to be worked out
          try {
            await this.mongo.insertOne('inbox', {
              actor: {id: actor.id, inbox: actor.inbox },
              data, // post data as received
              body: reqBody, // body as received
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
    }
  }
}

export default Server;

