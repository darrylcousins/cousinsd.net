import url from 'node:url';

class Request {

  url = null;
  method = null;
  httpVersion = null;
  filename = '';
  query = {};
  server = {};
  headers = {};
  cookies = {};
  form = {};
  post = {form:{}, files: [], parts: [], data: '', isMultiPart: false};

  constructor() {

    for (let name in process.env) {
      let value = process.env[name];
      name = name.toLowerCase();
      // If starts with http then remove 'http_' and add it to the http header array, otherwise add it to the server array.
      if (name.indexOf('http_') === 0) {
        this.headers[ name.substring('http_'.length) ] = value;
      } else {
        this.server[name] = value;
      }
    }

    this.method = this.server.request_method;
    this.httpVersion = this.server.server_protocol;
    this.headers.content_type = (this.server.hasOwnProperty('content_type') ? this.server.content_type : '');
    this.headers.content_length = (this.server.hasOwnProperty('content_length') ? this.server.content_length : 0);
    this.url = url.parse(this.server.request_uri, true);
    this.query = this.url.query;

    const parts  = this.url.pathname.split('/');
    if (parts.length > 2) {
      this.filename = parts[parts.length - 1];
    }
    this.filename = this.filename === '' ? 'index' : this.filename;
  }

}

export default Request;
