class Response {

  isHeaderSent = false;
  headers = {};

  constructor() {
    this.headers = {
      'status': '200 OK',
      'content-type': 'application/json',
      'pragma': 'no-cache'
    };
  }

  setStatus(status) {
    this.headers['status'] = status;
  }

  setContentType(content_type) {
    this.headers['content-type'] = content_type;
  }

  sendHeaders() {
    if (this.isHeaderSent) return;
    this.isHeaderSent = true; 
    for (var name in this.headers) process.stdout.write( name + ':' + this.headers[name] + '\n');
    process.stdout.write('\n');
  }

  write(string) {
    this.sendHeaders();
    if (typeof string === 'object') {
      string = JSON.stringify(string, null, 2);
    }
    process.stdout.write(string.toString());
  }

  end(status) {
    if (status) {
      this.headers.status = status;
    }
    this.sendHeaders();
    process.stdout.write('\n');
  }
}

export default Response;
