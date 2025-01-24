import { MockAgent } from 'undici';
import mockActor from './mock.actor.js';

const agent = new MockAgent();
agent.disableNetConnect();

const pool = agent.get('https://mastodon.nz');
pool.intercept({
  path: '/users/cousinsd',
  method: 'GET',
  headers: {
    accept: 'application/activity+json'
  }
}).reply(200, mockActor);

export default agent;

