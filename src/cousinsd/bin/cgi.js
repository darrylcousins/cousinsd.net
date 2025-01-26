#!/usr/bin/env node

import Server from '../lib/server.js';

const main = async () => {

  const server = new Server();
  server.logger.access();
  try {
    await server.run();
  } catch(e) {
    server.error(e);
  }
  await server.close(); 
}

export default main;
