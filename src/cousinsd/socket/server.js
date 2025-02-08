import fs from 'node:fs';
import { dirname, resolve, join } from 'node:path';
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
    console.log(data); // the data
    callback('Data received ... processing ...');
    let result;
    if (fs.existsSync(join(__dirname, `${data.type.toLowerCase()}.js`))) {
      result = await import(join(__dirname, `${data.type.toLowerCase()}.js`))
        .then(async ({ default: fn }) => await fn({data, mongo}));
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
    /*
    let object;
    switch(data.type) {
      case 'Accept':
        // accept the follow request
        object = await mongo.findOne('inbox', {_id: data.id});
        socket.emit("data_success", "Accept request received");
      case 'Ignore':
        // remove the inbox item
        //await this.mongo.deleteOne('inbox', {id: data.id});
        object = await mongo.findOne('inbox', {_id: data.id});
        socket.emit("data_success", "Ignore request received");
    }
    console.log("object", object);
    */
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
