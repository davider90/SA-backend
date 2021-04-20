/*
This file contains the database functionality of the backend.

Note how this in effect is an implementation of the singleton
pattern and the state pattern.

Explanation:
By "pretending" that db.js defines a class like it for instance
would in Java, and by only exporting the "methods" we would like
to be public, we end up with something that can be imported and
used like a traditional class.
Notice how the "class constructor", called instantiate here,
will check to see if it has already been instantiated. Also see
how all "public methods" except instatiate will not do anything
unless isInstatiated is true.
*/

import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;

// "Private" fields
const url = 'mongodb://localhost:27017/mydb';
let isInstantiated = false;
let mdb;  // Mongo database (general)
let psdb;  // Party Snake database

// "Public methods"
/**
 * Creates database connection when instantiated.
 * This may take some time, so use a callback if needed.
 * @param {Function} callback optional callback
 */
const instantiate = (callback = () => {}) => {
  if (!isInstantiated) {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
      if (err) throw err;
      console.log('Connected to database successfully!');
      mdb = db;
      psdb = db.db('PartySnakeDB');
      isInstantiated = true;
      setUp();
      callback();
    });
    return;
  }
  console.log('Database already instantiated');
}

/**
 * Closes the database connection. As the "class" is
 * essentially dead at this point, do not use any functions
 * before constructing a new "instance".
 */
const dispose = () => {
  if (!isInstantiated) return;
  mdb.close();
  isInstantiated = false;
  console.log('Disconnected from database');
}

/**
 * Gets the top ten high scores
 * @param {Function} callback callback to handle the result
 */
const getTopTen = (callback) => {
  if (!isInstantiated) return;
  const sort = { score: -1 };
  const filter = { player: 1, score: 1 };
  psdb.collection('players').find({}, filter)
                            .sort(sort)
                            .limit(10)
                            .toArray((err, result) => {
    if (err) throw err;
    callback(result);
  });
}

/**
 * Gets any information in the database about the player
 * @param {string} name the name of the player
 * @param {Function} callback callback to handle the result
 */
const getPlayer = (name, callback) => {
  if (!isInstantiated) return;
  const query = { player: name };
  const filter = { player: 1, score: 1 };
  psdb.collection('players').findOne(query, filter, (err, result) => {
    if (err) throw err;
    callback(result);
  });
}

/**
 * Updates the player's score. This may take some time,
 * so use a callback if needed.
 * @param {string} name the name of the player
 * @param {number} score the player's score
 * @param {Function} callback optional callback
 */
const updatePlayer = (name, score, callback = () => {}) => {
  if (!isInstantiated) return;
  const query = { player: name };
  const newValues = { $set: { score: score } };
  psdb.collection('players').updateOne(query, newValues, (err, res) => {
    if (err) throw err;
    console.log(`Player ${name} successfully updated!`)
    callback();
  })
}

/**
 * Passes true to callback iff name and password is registered
 * @param {string} name player / user name
 * @param {string} password personal password
 * @param {Function} callback callback to handle boolean result
 */
const logIn = (name, password, callback) => {
  if (!isInstantiated) return;
  const query = { player: name, password: password };
  psdb.collection('players').findOne(query, (err, result) => {
    if (err) throw err;
    callback(result != null);
  })
}

/**
 * Creates a new user in the database
 * @param {*} name player / user name
 * @param {*} password new personal password
 * @param {*} callback optional callback
 */
const newUser = (name, password, callback) => {
  if (!isInstantiated) return;
  getPlayer(name, (result) => {
    if (result) callback(false);
    const newPlayer = {
      player: name,
      score: 0,
      password: password
    };
    psdb.collection('players').insertOne(newPlayer, (err, res) => {
      if (err) throw err;
      console.log(`Player ${name} successfully added!`);
      callback(true);
    });
  })
}

// "Private method"
/**
 * Checks if the database collection has been set up yet,
 * and sets it up if it hasn't
 */
 const setUp = () => {
  if (!isInstantiated) return;
  psdb.listCollections({name: 'players'}).next((err, result) => {
    if (err) throw err;
    if (result) {
      console.log('Database already set up');
      return;
    }
    psdb.createCollection('players', (err, res) => {
      if (err) throw err;
      psdb.collection('players').createIndex({ player: 1 }, { unique: true });
      console.log('Set up database successfully!');
    });
  });
}

// Exporting of "public methods"
export default {
  instantiate,
  dispose,
  getTopTen,
  getPlayer,
  updatePlayer,
  logIn,
  newUser
}
