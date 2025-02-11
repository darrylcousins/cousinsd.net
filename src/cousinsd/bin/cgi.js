#!/usr/bin/env node

import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
//dotenv.config({ path: join(__dirname, '../.env') });

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
