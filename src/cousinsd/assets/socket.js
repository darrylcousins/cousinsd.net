import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { collapseElement, expandElement } from "./animator.js";

let objectId;
let err = 'false';

const appendMessage = (message, colour) => {
  const content = document.createTextNode(`${message}\n`);
  const feedback = document.querySelector(`#feedback-${objectId}`);
  if (colour) {
    const node = document.createElement('span');
    node.classList.add(colour);
    node.appendChild(content);
    feedback.appendChild(node);
  } else {
    feedback.appendChild(content);
  }
}

export const IOConnect = async (opts) => {
  const { id, token, data, callback } = opts;
  objectId = id;
  const actionEl = document.querySelector(`#action-${objectId}`);
  appendMessage('Making connection to server ...', 'blue');
  expandElement(actionEl);

  const socket = io({
    transports: ["websocket"],
    auth: { token },
    reconnection: false,
  });

  socket.on('connect', () => {
    appendMessage('Connected ... sending data:', 'green');
    appendMessage(JSON.stringify({ ...data, object: '{ ... }'}, null, 2));

    socket.emit('data_request', data, (response) => {
      appendMessage(response, 'blue');
    });
    expandElement(actionEl);
  });

  socket.on('data_progress', (message) => {
    appendMessage(message, 'blue');
  });

  socket.on('data_plain', (message) => {
    appendMessage(message);
  });

  socket.on('data_success', (message) => {
    appendMessage(message, 'green');
    const close = document.querySelector(`[id^="response-${objectId}"]`);
    err = 'false';
    close.id = `response-${objectId}-${err}`;
  });

  socket.on('data_failure', (message) => {
    appendMessage(message, 'red');
    const close = document.querySelector(`[id^="response-${objectId}"]`);
    err = 'true';
    close.id = `response-${objectId}-${err}`;
  });

  socket.on('data_complete', (data) => {
    if (callback) {
      callback(data);
    }
  });


  socket.on('connect_error', (err) => {
    appendMessage(err.message, 'red');
    if (err.data) {
      appendMessage(err.data, 'red');
    }
    appendMessage('Connection failed', 'red');
  });

  socket.on('disconnect', (reason, details) => {
    appendMessage(`Disconnect due to ${reason}`, 'orange');
    const close = document.querySelector(`[id^="response-${objectId}"]`);
    close.classList.remove('dn');
  });
}

