/*
This file contains the backend's game logic.

It uses the same "trick" as db.js and socketIO.js
in the sense that it pretends to be a class, but it
does not implement the singleton pattern as it is
unnecessary here.
*/

// "Private fields"
let boards;
// For defining the confines of the board
let maxX = 10;
let maxY = 10;

// "Public methods"
/**
 * Pushes a new game board to boards
 * @param {number} room the game's room number
 */
const newGame = (room) => {
  boards.push({
    room: room,
    board: {
      p1: [[]],
      p2: [[]],
      apple: []
    },
    time: -1
  })
}

/**
 * Gets a game from boards by searching for
 * a game in room number room
 * @param {number} room the game's room number
 */
const getGame = (room) => {
  return boards[findGameByRoom(room)];
}

/**
 * Updates the server's board, and calls callback(0).
 * If the boardObject is outdated, callback(-1) is called.
 * @param {Object} boardObject updated board
 * @param {Function} callback callback function
 */
const gameTick = (room, boardObject, callback) => {
  const serverBoard = boards[findGameByRoom(room)];
  if (boardObject.time < serverBoard.time) {
    callback(-1);
    return;
  }
  for (const key of Object.keys(boardObject.board)) {
    serverBoard.board[key] = boardObject.board[key];
  }
  if (isGameOver(serverBoard, callback)) return;
  serverBoard.time = boardObject.timestamp;
  if (serverBoard.board.apple == [] || serverBoard.time % 10 == 0) {
    serverBoard.board.apple = newApple(serverBoard);
  }
  callback(0);
}

/**
 * "Ends" a game by removing it from boards
 * @param {number} room the room number
 * @param {Function} callback optional callback
 */
const endGame = (room, callback = () => {}) => {
  const gameIndex = findGameByRoom(room);
  boards.splice(gameIndex, 1);
  callback();
}

// "Private methods"
/**
 * Checks if any player has won.
 * @param {Function} callback callback function
 * @returns true if game is over, else false
 */
const isGameOver = (serverBoard, callback) => {
  const p1 = serverBoard.board.p1;
  const p2 = serverBoard.board.p2;
  const p1HeadPos = p1[0];
  const p2HeadPos = p2[0];
  for (let index = 1; index < p1.length; index++) {
    if (p2HeadPos == p1[index]) {
      callback(1);
      return true;
    }
  }
  for (let index = 1; index < p2.length; index++) {
    if (p1HeadPos == p2[index]) {
      callback(2);
      return true;
    }
  }
  return false;
}

/**
 * QOL function to find the index of a game via
 * the game's room number
 * @param {number} room the game's room number
 * @returns the found game or none
 */
const findGameByRoom = (room) => {
  return boards.findIndex((element, i) => {
    return element.room == room;
  });
}

/**
 * Adds a new apple at a random unoccupied square
 * @param {Object} serverBoard 
 */
const newApple = (serverBoard) => {
  while (serverBoard.apple == []) {
    let X = shuffle(generateArray(maxX));
    let Y = shuffle(generateArray(maxY));
    for (let xIndex = 0; xIndex < maxX; xIndex++) {
      for (let yIndex = 0; yIndex < maxY; yIndex++) {
        let takenByP1 = serverBoard.p1.find((element, i) => {
          return element == [X[xIndex], Y[yIndex]];
        });
        let takenByP2 = serverBoard.p2.find((element, i) => {
          return element == [X[xIndex], Y[yIndex]];
        });
        if (!takenByP1 && !takenByP2) {
          serverBoard.apple = [X[xIndex], Y[yIndex]];
          return;
        }
      }
    }
  }
}

/**
 * Generates an array of the numbers 1 to n
 * @param {number} n 
 * @returns the generated array
 */
const generateArray = (n) => {
  let array = new Array(n+1);
  for (let index = 0; index < n+1; index++) {
    array[index] = index + 1;
  }
  return array;
}

/**
 * Shuffles an array by using Fisher-Yates/Knuth shuffle.
 * Source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {Array} array 
 * @returns the shuffled array
 */
const shuffle = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// Exporting of "public methods"
export default {
  newGame,
  getGame,
  gameTick,
  endGame
}
