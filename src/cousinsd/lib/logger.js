
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';

class Logger {

  server_string = ""; // method and path
  access_string = ""; // method, path, remote info
  dateFormat;
  fileHandles = {};

  constructor(server) {
    const baseAttributes = [
      'request_method',
      'request_uri',
    ]
    const accessAttributes = [
      ...baseAttributes,
      'remote_addr',
      'user_agent'
    ]
    for (const attr of baseAttributes) {
      if (Object.hasOwnProperty.call(server, attr)) {
        this.server_string = `${this.server_string} ${server[attr]}`;
      }
    }
    for (const attr of accessAttributes) {
      if (Object.hasOwnProperty.call(server, attr)) {
        this.access_string = `${this.access_string} ${server[attr]}`;
      }
    }
    this.dateFormat = new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Pacific/Auckland',
      timeZoneName: 'shortOffset'
    });
    this.fileHandles = {
      'app': null,
      'access': null,
      'error': null,
    }
    this.logPath = process.env.LOG_PATH;
  }

  formatDatetime() {
    return this.dateFormat.format(new Date()).slice(5).replaceAll(',', '');
  }

  logToFile(msg, f) {

    if (typeof msg === 'object') {
      msg = JSON.stringify(msg, null, 2);
    }
    let line = `[${this.formatDatetime()}]${(f === 'access') ? `${this.access_string}` : `${this.server_string}`}`;
    //if (msg.length) line = `${line} ${msg.toString()}`;
    line = `${line} ${msg.toString()}`;
    line = `${line}\n`;

    if (!this.fileHandles[f]) this.fileHandles[f] = fs.openSync(path.join(`${this.logPath}`, `${f}.log`), 'a');
    fs.appendFileSync(this.fileHandles[f], line);
  }

  app(msg) {
    this.logToFile(msg, 'app');
  }

  access() {
    this.logToFile('', 'access');
  }

  error(msg) {
    if (msg instanceof Error) {
      msg = msg.stack;
    };
    this.logToFile(msg, 'error');
  }

  close() {
    for (const key of Object.keys(this.fileHandles)) {
      if (this.fileHandles[key]) fs.closeSync(this.fileHandles[key]);
    }
  };
}

export default Logger;
