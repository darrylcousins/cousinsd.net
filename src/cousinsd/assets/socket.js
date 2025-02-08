import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";
import { collapseElement, expandElement } from "/cousinsd/animator.js";

let objectId;
let feedback;
let err = 'false';

const appendMessage = (message, colour) => {
  const content = document.createTextNode(`${message}\n`);
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
  const { action, type, id, token, data } = opts;
  objectId = id;
  const actionEl = document.querySelector(`#action-${objectId}`);
  feedback = document.querySelector(`#feedback-${objectId}`);

  const socket = io({
    transports: ["websocket"],
    auth: { token },
  });

  socket.on('connect', () => {
    appendMessage('Connected ... sending data:', 'green');
    appendMessage(JSON.stringify({ ...data, object: '{ ... }'}, null, 2));

    expandElement(actionEl, () => {
      socket.emit('data_request', data, (response) => {
        appendMessage(response, 'blue');
      });
    });

  });

  socket.on('data_success', (message) => {
    appendMessage(message, 'green');
    const close = document.querySelector(`#response-${objectId}-${err}`);
    err = 'false';
    close.id = `response-${objectId}-${err}`;
  });

  socket.on('data_failure', (message) => {
    appendMessage(message, 'red');
    const close = document.querySelector(`#response-${objectId}-${err}`);
    err = 'true';
    close.id = `response-${objectId}-${err}`;
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
    const close = document.querySelector(`#response-${objectId}-${err}`);
    close.classList.remove('dn');
  });
}

