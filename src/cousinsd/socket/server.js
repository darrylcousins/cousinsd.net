import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import Mongo from '../lib/mongo.js';

import dotenv from 'dotenv';
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const mongo = new Mongo(process.env.MONGO_URI);

const httpServer = createServer(
);

const io = new Server(httpServer, {
  addTrailingSlash: false,
});

io.on('connection', (socket) => {
  console.log('connected');

  socket.on('data_request', async (data, callback) => {

    callback('Data received ... processing ...');

    const cb = (message, plain, final) => {
      if (plain) {
        socket.emit("data_plain", message);
      } else if (final) {
        socket.emit("data_complete", message);
      } else {
        socket.emit("data_progress", message);
      }
    }

    let result;
    if (fs.existsSync(join(__dirname, `${data.type.toLowerCase()}.js`))) {
      result = await import(join(__dirname, `${data.type.toLowerCase()}.js`))
        .then(async ({ default: fn }) => await fn({data, mongo, cb}));
    }
    if (!result) {
      socket.emit("data_failure", "Activity type unknown");
    } else if (result.error) {
      socket.emit("data_failure", result.message);
    } else {
      socket.emit("data_success", result.message);
    }
    setTimeout(() => {
      socket.disconnect(true);
    }, 1000);
  });

});

io.use(async (socket, next) => {
  let err;
  if (!Object.hasOwnProperty.call(socket.handshake.auth, 'token')) {
    err = new Error('Failed authorization');
    err.data = 'Missing authentiation token';
    next(err);
    return;
  }
  const token = await mongo.findOne('tokens', {name: process.env.NAME}); 
  if (socket.handshake.auth.token !== token.token) {
    err = new Error('Failed authorization');
    err.data = 'Incorrect authentiation token';
    next(err);
    return;
  }
  next();
});

const hostname = '127.0.0.1';
const port = 3443;

httpServer.listen(port, hostname, () => {
  console.log(process.env.MONGO_URI);
  console.log(`Server running at http://${hostname}:${port}/`);
});
