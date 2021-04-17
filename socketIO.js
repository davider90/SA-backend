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
      const auth = socket.handshake.auth;
      db.logIn(auth.name, auth.password, (result) => {
        if (result) {
          next();
        } else {
          const err = new Error("Authentication failed");
          err.data = "User not found";
          next(err);
        }
      })
    });
    io.on('connection', socketSetup);
    return;
  }
  console.log('Server already running');
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
  socket.on('newGame', async (callback) => {
    newGame(socket, callback);
  });
  socket.on('gameOver', gameOver);
  // POSSIBLE RECONNECTION HANDLING
  // const inGame = gameSessions.find((element, index) => {
  //   return element.player1 == '' || element.player2 == '';
  // })
  // inGame && socket.join(inGame.room);
}

const gameOver = () => {};

const newGame = async (socket, callback) => {
  const name = socket.handshake.auth.name;
  const clients = await io.fetchSockets();
  let opponent;
  for (let index = 0; index < clients.length; index++) {
    if (clients[index].handshake.auth.name == name) continue;
    const accepted = await requestGame(name, clients[index]);
    if (accepted) {
      opponent = clients[index];
      break;
    }
  }
  if (opponent) {
    const p2Name = opponent.handshake.auth.name;
    const i = nextSessionNumber();
    gameSessions.push({
      room: i,
      player1: name,
      player2: p2Name
    });
    socket.join(`room${i}`);
    opponent.join(`room${i}`);
    callback(i, p2Name);
  } else {
    callback(null, null);
  }
}

const requestGame = async (from, to) => {
  return new Promise((resolve) => {
    to.emit('gameRequest', from, (response) => {
      resolve(response != null);
    });
  })
}

const nextSessionNumber = () => {
  let i = 0;
  while (true) {
    const session = gameSessions.find((element, index) => {
      return element.room == i;
    })
    if (!session) break;
    i++;
  }
  return i;
}

export default instantiate;
