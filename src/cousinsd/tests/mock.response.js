import { workerData } from 'node:worker_threads';
import Response from '../lib/response.js';

/* node:coverage disable */
if (!workerData) {
  throw new TypeError('Worker data missing, method name not supplied');
}
if (typeof workerData.method !== 'string') {
  throw new TypeError('Worker data invalid, method name not supplied');
}
if (workerData.method === 'write') {
  if (!workerData.data || (typeof workerData.data !== 'string' && typeof workerData.data !== 'object')) {
    throw new TypeError('Worker data invalid, data to write should be a string or json object');
  }
}
/* node:coverage enable */

const response = new Response();

let data;

if (Array.isArray(workerData.data)) { // can pass multiple values to be written out
  for (const str of workerData.data) {
    response.write(str);
  }
} else {
  response[workerData.method](workerData.data);
}
