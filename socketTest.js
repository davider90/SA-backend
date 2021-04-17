import { io } from "socket.io-client";

const socket = io('http://127.0.0.1:3000/');
socket.on('connect', () => console.log(socket.id));
setTimeout(() => socket.emit('getTopTen', (response) => {
  console.log(response);
}), 1000);
setTimeout(() => socket.disconnect(), 2000);
