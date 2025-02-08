import fs from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { Readable } from 'node:stream';
import { MockAgent, setGlobalDispatcher } from 'undici';
import Signature from '../lib/signature.js';
import mockActor from './mock.actor.js';

export const __dirname = dirname(fileURLToPath(import.meta.url));

export const actor = 'https://cousinsd.net/cousinsd';
export const username = 'cousinsd';

/*
 * Helper method
 * Remove test log
 */
export const cleanLogs = () => {
  if (fs.existsSync(`${process.env.LOG_PATH}/app.log`)) {
    fs.unlinkSync(`${process.env.LOG_PATH}/app.log`);
  }
  if (fs.existsSync(`${process.env.LOG_PATH}/access.log`)) {
    fs.unlinkSync(`${process.env.LOG_PATH}/access.log`);
  }
  if (fs.existsSync(`${process.env.LOG_PATH}/error.log`)) {
    fs.unlinkSync(`${process.env.LOG_PATH}/error.log`);
  }
}

/*
 * Helper method
 * Read test log
 */
export const logString = (f) => {
  if (fs.existsSync(`${process.env.LOG_PATH}/${f}.log`)) {
    const data = fs.readFileSync(`${process.env.LOG_PATH}/${f}.log`);
    return data.toString();
  }
}

/*
 * Helper method
 * Return key: value object from array of key: value strings
 * Ignores empty lines
 */
export const headerStringToObject = (arr) => {
  arr = arr.filter(el => el != '');
  let result = {};
  arr.map(el => {
    const parts = el.split(':').map(el => el.trim());
    result[parts[0]] = parts[1];
  });
  return result;
}

/*
 * Helper method
 * Construct signature headers
 */
export const getSigHeaders = (data) => {
  const signature = new Signature();
  let reqBody = JSON.stringify(data);
  const inbox = `${actor}/inbox`;
  //const sig = signature.sign(reqBody);
  const privateKey = fs.readFileSync(join(__dirname, 'test-private.pem')).toString();
  return signature.headers({ inbox, reqBody, privateKey, keyId: mockActor.id });

};

/*
 * Helper method
 * Worker for mock process and returns stdout as a string
 */
export const mockServer = async (data, input) => {
  let stdin = input ? true : false;
  return new Promise((resolve, reject) => {
    let output = '';
    const worker = new Worker(join(__dirname, 'mock.server.js'), {
      stdout: true,
      stdin,
      workerData: data,
    });
    if (stdin) {
      const readable = new Readable();
      readable._read = function () {};
      readable.push(input.data);
      readable.push(null);
      readable.pipe(worker.stdin);
    }
    /* node:coverage disable */
    worker.on('error', (err) => {
      reject(err);
    });
    /* node:coverage enable */
    worker.stdout.on('data', (msg) => {
      output += msg.toString();
    });
    worker.stdout.on('close', (msg) => {
      //cb(output);
      resolve(output);
    });
  });
};

