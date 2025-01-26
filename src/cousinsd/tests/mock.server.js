import { workerData } from 'node:worker_threads';
import { setGlobalDispatcher } from 'undici';
import Server from '../lib/server.js';
import agent from './mock.agent.js';

setGlobalDispatcher(agent);

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

const server = new Server();

const main = async () => {
  await server[workerData.method](workerData.data);
}

main();
