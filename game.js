/*
This file contains the backend's game logic.
*/

let boards;

/**
 * Pushes a new game board to boards
 * @param {number} room the game's room number
 */
const newGame = (room) => {
  boards.push({
    room: room,
    board: [[]],
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
  if (boardObject.timestamp < serverBoard.time) {
    callback(-1);
    return;
  }
  serverBoard.board = boardObject.board;
  serverBoard.time = boardObject.timestamp;
  if (isGameOver(callback)) return;
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

/**
 * WORK IN PROGRESS!
 * Checks if any player has won.
 * @param {Function} callback callback function
 * @returns true if game is over, else false
 */
 const isGameOver = (callback) => {
  // Check if a player has crashed.
  // callback(1) means player 1 won.
  // callback(2) means player 2 won.
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

export default {
  newGame,
  getGame,
  gameTick,
  endGame
}
