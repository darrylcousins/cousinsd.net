
import process from 'node:process';
import fs from 'node:fs';

class Logger {

  server_string = ""

  constructor(server) {
    const attributes = [
      'request_method',
      'request_uri',
      'remote_addr',
      'user_agent'
    ]
    for (const attr of attributes) {
      if (Object.hasOwnProperty.call(server, attr)) {
        this.server_string = `${this.server_string} ${server[attr]}`;
      }
    }
  }

  logToFile(msg, f) {

    if (typeof msg === 'object') {
      msg = JSON.stringify(msg, null, 2);
    }
    // date in NZDT
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
    const date = localISOTime.replace(/T/, ' ').replace(/\..+/, '');
    const vars = (f === 'app') ? "" : `${this.server_string}`;
    const line = `${date}${vars} ${msg.toString()}\n`;
    fs.appendFileSync(`${process.cwd()}/${f}.log`, line);
  }

  app(msg) {
    this.logToFile(msg, 'app');
  }

  access(msg) {
    this.logToFile(msg, 'access');
  }

  error(msg) {
    this.logToFile(msg, 'error');
  }
}

export default Logger;
