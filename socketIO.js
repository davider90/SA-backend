/*
This file contains the Socket.io logic of the backend.
*/

import { Server } from "socket.io";
import db from "./db.js";
import game from "./game.js";

let io;  // Socket.io server object
let isInstantiated = false;
let gameSessions = [];

/**
 * Starts the Socket.io server and makes it listen at
 * http://{hostname}:{port}/
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
      });
    });
    io.on('connection', socketSetup);
    io.of(/room\d+/).on('disconnect', (socket) => {
      const name = socket.handshake.auth.name;
      const session = findSessionByPlayer(name);
      terminateGame(session.room, `Player "${name}" disconnected`);
    });
    return;
  }
  console.log('Server already running');
}

/**
 * Does the necessary setup for a new connection
 * @param {Socket} socket the new socket object
 */
const socketSetup = (socket) => {
  const name = socket.handshake.auth.name;
  console.log(`New connection: ${socket.id}`);
  socket.on('disconnected', (reason) => {
    console.log(`Client "${socket.id}" disconnected: ${reason}`);
  });
  socket.join('mainRoom');
  socket.on('getTopTen', db.getTopTen);
  socket.on('getPlayer', (callback) => {
    db.getPlayer(name, callback);
  });
  socket.on('updatePlayer', (score, callback) => {
    db.updatePlayer(name, score, callback);
  });
  socket.on('newGame', async (callback) => {
    newGame(socket, callback);
  });
  socket.on('quitGame', async () => playerQuit(socket));
  socket.on('tick', (boardObject) => {
    gameTick(findSessionByPlayer(name).room, boardObject);
  })
  // POSSIBLE RECONNECTION HANDLING
  // const inGame = gameSessions.find((element, index) => {
  //   return element.player1 == '' || element.player2 == '';
  // })
  // inGame && socket.join(inGame.room);
}

/**
 * Updates the server's board, and ends the game if any
 * of the two players win.
 * @param {number} room the game's room number
 * @param {Object} boardObject the received board object
 */
const gameTick = (room, boardObject) => {
  game.gameTick(room, boardObject, (status) => {
    if (status <= 0) return;
    const session = gameSessions[findSessionByNumber(room)];
    const winner = status == 1 ? session.player1 : session.player2;
    terminateGame(room, `Player "${winner}" won the game!`);
  });
}

/**
 * Updates the players about the state of the board
 * @param {number} room the game's room number
 */
const gameUpdate = (room) => {
  io.to(`room${room}`).volatile.emit(game.getGame(room).board);
}

/**
 * Tries to create a new game by inviting another player
 * and creating a game session for the two players. Calls
 * the callback with arguments: game room number, opponent.
 * @param {Socket} socket the initiating socket
 * @param {Function} callback response callback
 */
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
      player2: p2Name,
      updater: setInterval(gameUpdate(i), 100)
    });
    socket.join(`room${i}`);
    opponent.join(`room${i}`);
    game.newGame(`room${i}`);
    callback(i, p2Name);
  } else {
    callback(null, null);
  }
}

/**
 * Sends a game invite from from to to. Times out if to does
 * not respond within 10 seconds.
 * @param {string} from name of the player inviting
 * @param {Socket} to the invited player's socket
 * @returns promise of boolean saying whether game invite was accepted
 */
const requestGame = async (from, to) => {
  return new Promise((resolve, reject) => {
    const timeout = () => reject(null);
    to.emit('gameRequest', from, (response) => {
      // Not sure if this works yet
      doWithTimeout(resolve, timeout, 10000)([response != null]);
    });
  });
}

/**
 * Handles if one of the players in a game quits
 * @param {Socket} socket the quitting player's socket
 */
const playerQuit = async (socket) => {
  const name = socket.handshake.auth.name;
  const room = Array.from(socket.rooms).find((element, i) => {
    return element.search(/room\d+/) > -1;
  })
  terminateGame(parseInt(room.substr(4)), `Player "${name}" quit`);
}

/**
 * Terminates a game session
 * @param {number} room the game session's room nunmber
 * @param {string} reason reason for game termination
 */
const terminateGame = async (room, reason) => {
  const sessionIndex = findSessionByNumber(room);
  clearInterval(gameSessions[sessionIndex].updater);
  const socket1 = await findSocketByName(gameSessions[sessionIndex].player1);
  const socket2 = await findSocketByName(gameSessions[sessionIndex].player2);
  socket1.emit('endGame', reason);
  socket1.leave(`room${room}`);
  socket2.emit('endGame', reason);
  socket2.leave(`room${room}`);
  game.endGame(`room${room}`);
  gameSessions.splice(sessionIndex, 1);
};

/**
 * Finds the first number i such that 'room{i}' would be a
 * unique room for a game session
 * @returns first available number
 */
const nextSessionNumber = () => {
  let i = 0;
  while (true) {
    const sessionIndex = findSessionByNumber(i);
    if (sessionIndex < 0) break;
    i++;
  }
  return i;
}

/**
 * Finds the socket associated with name
 * @param {string} name the player name to search for
 * @returns the found socket or null
 */
const findSocketByName = async (name) => {
  const clients = await io.fetchSockets();
  return clients.find((element, i) => {
    return element.handshake.auth.name == name;
  });
}

/**
 * Finds the index of the game session with number as room number
 * @param {number} number room number of game session
 * @returns index of the found session or -1
 */
const findSessionByNumber = (number) => {
  return gameSessions.findIndex((element, index) => {
    return element.room == number;
  });
}

/**
 * Finds the game session with player as member
 * @param {string} player the name of the player
 * @returns the found session or null
 */
const findSessionByPlayer = (player) => {
  return gameSessions.find((element, i) => {
    return element.player1 == player || element.player2 == player;
  });
}

/**
 * Tries to execute onSuccess, but will call onTimeout if
 * onSuccess has not completed before timeout.
 * @param {Function} onSuccess what to do on success
 * @param {Function} onTimeout what to do on timeout
 * @param {number} timeout timeout in number of ms
 * @returns function that calls onSuccess iff not timed out
 */
const doWithTimeout = (onSuccess, onTimeout, timeout) => {
  let called = false;
  const timer = setTimeout(() => {
    if (called) return;
    called = true;
    onTimeout();
  }, timeout);
  return (...args) => {
    if (called) return;
    called = true;
    clearTimeout(timer);
    onSuccess.apply(this, args);
  }
}

export default instantiate;
