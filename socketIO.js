import { Server } from "socket.io";
import db from "./db.js";

let io;
let isInstantiated = false;
let gameSessions = [];
/*
IMAGINED FORMAT
session {
  room: room,
  player1: name,
  player2: name
}
*/

/**
 * Starts the Socket.io server and makes it listen at
 * http://[hostname]:[port]/
 * @param {string} hostname defaults to "localhost"
 * @param {number} port defaults to 3000
 */
const instantiate = (hostname = '127.0.0.1', port = 3000) => {
  if (!isInstantiated) {
    io = new Server(port, {
      cors: {
        origin: `http://${hostname}:${port}/`,
        methods: ['GET', 'POST']
      }
    });
    io.use((socket, next) => {
      next();
    });
    io.on('connection', socketSetup);
    return;
  }
  console.log('Server already running')
}

/**
 * Does the necessary setup for a new connection
 * @param {Socket} socket the new socket object
 */
const socketSetup = (socket) => {
  console.log(`New connection: ${socket.id}`);
  socket.on('disconnected', (reason) => {
    console.log(`Client "${socket.id}" disconnected: ${reason}`);
  });
  socket.join('mainRoom');
  socket.on('getTopTen', db.getTopTen);
  socket.on('getPlayer', db.getPlayer);
  socket.on('updatePlayer', db.updatePlayer);
  socket.on('newGame', (callback) => {
    newGame(socket.name, callback);
  });
  // POSSIBLE RECONNECTION HANDLING
  // const inGame = gameSessions.find((element, index) => {
  //   return element.player1 == '' || element.player2 == '';
  // })
  // inGame && socket.join(inGame.room);
}

const newGame = (name, callback) => {
  const clients = await io.fetchSockets();
  if (clients.length < 2) {
    callback(null, null);
    return;
  }
  clients.forEach(element => {
    return;
  });
}

const requestGame = (from, to, callback) => {
  to.emit('gameRequest', from, (response) => {
    if (response) {
      let i = 0;
      while (true) {
        const session = gameSessions.find((element, index) => {
          return element.room == i
        })
        if (!session) break;
        i++;
      }
      gameSessions.push({
        room: i,
        player1: from,
        player2: to
      })
      callback(i, to);
    }
    else callback(null, null);
  });
}

startServer();

export default {}
