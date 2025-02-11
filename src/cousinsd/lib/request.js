import fs from 'node:fs';
import url from 'node:url';

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class Request {

  url = null;
  method = null;
  httpVersion = null;
  filename = '';
  query = {};
  env = {};
  headers = {};
  cookies = {};
  form = {};
  post = {form:{}, files: [], parts: [], data: '', isMultiPart: false};

  constructor(env) {

    if (!env) env = {};

    const server_env = { ...process.env, ...env };

    for (let name in server_env) {
      let value = server_env[name];
      name = name.toLowerCase();
      // If starts with http then remove 'http_' and add it to the http header array, otherwise add it to the env array.
      if (name.indexOf('http_') === 0) {
        this.headers[ name.substring('http_'.length) ] = value;
      } else {
        this.env[name] = value;
      }
    }

    this.method = this.env.request_method;
    this.httpVersion = this.env.server_protocol;

    this.env.content_type ??= '';
    this.headers.content_type = this.env.content_type;
    this.env.content_length ??= 0;
    this.headers.content_length = parseInt(this.env.content_length);

    this.url = url.parse(this.env.request_uri, true);
    this.query = this.url.query;

    const parts  = this.url.pathname.split('/');
    if (parts.length > 2) {
      this.filename = parts[parts.length - 1];
    }
    // letting server handle this
    //this.filename = this.filename === '' ? 'index' : this.filename;
  }

}

export default Request;
