#!/usr/bin/env node

import dotenv from 'dotenv';
import Server from './cgi-lib/server.js';

dotenv.config();

const main = async () => {

  const server = new Server(process.env.DOMAIN, process.env.NAME, process.env.MONGO_URI);
  server.logger.access('');
  try {
    await server.run();
  } catch(e) {
    server.error(e);
  }
  // run methods may call close e.g. on error
  await server.close(); 
}

main();
