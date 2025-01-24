#!/usr/bin/env node

import Server from '../lib/server.js';

const main = async () => {

  const server = new Server(process.env.DOMAIN, process.env.NAME, process.env.MONGO_URI);
  server.logger.access();
  try {
    await server.run();
  } catch(e) {
    server.error(e);
  }
  await server.close(); 
}

export default main;
