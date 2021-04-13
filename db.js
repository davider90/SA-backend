// The database functionality of the backend.
// Note how this in effect is an implementation of
// the singleton pattern.

import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;

// "Private" fields
const url = "mongodb://localhost:27017/mydb";
let isInstantiated = false;
let mdb;  // Mongo database (general)
let psdb;  // Party Snake database

/**
 * Creates database connection when instantiated.
 * This may take some time, so use a callback if needed.
 * @param {Function} callback optional callback
 */
const instantiate = (callback = () => {}) => {
  if (!isInstantiated) {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
      if (err) throw err;
      console.log("Connected to database successfully!");
      mdb = db;
      psdb = db.db("PartySnakeDB");
      isInstantiated = true;
      callback();
    });
    return;
  }
  console.log("Database already instantiated.");
}

/**
 * Simply creates the collection.
 * Run immediately if the database has not been set up before.
 */
const setUp = () => {
  psdb.createCollection("players", (err, res) => {
    if (err) throw err;
    console.log("Set up database successfully!");
  })
}

/**
 * Closes the database connection. As the "class" is
 * essentially dead at this point, do not use any functions
 * before constructing a new "instance".
 */
const dispose = () => {
  mdb.close();
  isInstantiated = false;
  console.log("Disconnected from database.");
}

/**
 * Gets the top ten high scores
 * @param {Function} callback callback to handle the result
 */
const getTopTen = (callback) => {
  const sort = { score: -1 };
  psdb.collection("players").find()
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
  const query = { player: name };
  psdb.collection("players").findOne(query, (err, result) => {
    if (err) throw err;
    callback(result);
  });
}

/**
 * Updates the player's score, or creates an entry if none exists.
 * This may take some time, so use a callback if needed.
 * @param {string} name the name of the player
 * @param {number} score the player's score
 * @param {Function} callback optional callback
 */
const updatePlayer = (name, score, callback = () => {}) => {
  getPlayer(name, (result) => {
    if (result == null) {
      createNewPlayer(name, score, callback);
      return;
    }
    actuallyUpdatePlayer(name, score, callback);
  });
}

/**
 * "Private method".
 * Logic of updating a player.
 * @param {string} name the name of the player
 * @param {number} score the player's score
 * @param {Function} callback callback (may be empty function)
 */
const actuallyUpdatePlayer = (name, score, callback) => {
  const query = { player: name };
  const newValues = { $set: { score: score } };
  psdb.collection("players").updateOne(query, newValues, (err, res) => {
    if (err) throw err;
    console.log(`Player ${name} successfully updated!`)
    callback();
  })
}

/**
 * "Private method".
 * Logic of creating a new player entry.
 * @param {string} name the name of the player
 * @param {number} score the player's score
 * @param {Function} callback callback (may be empty function)
 */
const createNewPlayer = (name, score, callback) => {
  const newPlayer = { player: name, score: score };
  psdb.collection("players").insertOne(newPlayer, (err, res) => {
    if (err) throw err;
    console.log(`Player ${name} successfully added!`)
    callback();
  });
}

// Exports "public methods"
export default {
  instantiate,
  setUp,
  dispose,
  getTopTen,
  getPlayer,
  updatePlayer
}
