import { io } from "socket.io-client";

const socket = io('http://35.228.7.69:3000/', {
  auth: {
    name: 'David',
    password: 'test',
    new: 'false'
  }
});
socket.on('disconnect', (reason) => console.log(reason));
socket.on('connect_error', (err) => console.log(err))
socket.on('connect', () => console.log(socket.id));
setTimeout(() => socket.emit('getTopTen', (response) => {
  console.log(response);
}), 4000);
setTimeout(() => socket.disconnect(), 8000);
