// The database functionality of the backend.
// Note how this in effect is an implementation of
// the singleton pattern.

import mongodb from "mongodb";
const MongoClient = mongodb.MongoClient;

// "Private" fields
const url = "mongodb://localhost:27017/mydb";
let isInstantiated = false;
let dataBase;
let subDB;

/**
 * Creates database connection when instantiated
 */
const instantiate = () => {
  if (!isInstantiated) {
    MongoClient.connect(url, { useUnifiedTopology: true }, (err, db) => {
      if (err) throw err;
      console.log("Connected to database successfully!");
      dataBase = db;
      subDB = db.db("PartySnakeDB");
    });
    isInstantiated = true;
    return;
  }
  console.log("Database already instantiated.");
}

/**
 * Simply creates the collection.
 * Run immediately if the database has not been set up before.
 */
const setUp = () => {
  subDB.createCollection("players", (err, res) => {
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
  dataBase.close();
  isInstantiated = false;
  console.log("Disconnected from database.");
}

/**
 * Gets the top ten high scores
 * @returns {Array} the results
 */
const getTopTen = () => {
  const sort = { score: -1 };
  subDB.collection("players").find()
                             .sort(sort)
                             .limit(10)
                             .toArray((err, result) => {
    if (err) throw err;
    return result;
  });
}

/**
 * Gets any information in the database about the player
 * @param {string} name the name of the player
 * @returns {Object} the results if any
 */
const getPlayer = (name) => {
  const query = { player: name };
  subDB.collection("players").findOne(query, (err, result) => {
    if (err) throw err;
    return result;
  });
}

/**
 * Updates the player's score, or creates an entry if none exists
 * @param {string} name the name of the player
 * @param {int} score the player's score
 */
const updatePlayer = (name, score) => {
  const player = getPlayer(name);
  if (player == {}) {
    createNewPlayer(name, score);
    return;
  }
  actuallyUpdatePlayer(name, score);
}

/**
 * "Private method".
 * Logic of updating a player.
 * @returns 
 */
const actuallyUpdatePlayer = (name, score) => {
  const query = { player: name };
  const newValues = { $set: { score: score } };
  subDB.collection("players").updateOne(query, newValues, (err, res) => {
    if (err) throw err;
    console.log(`Player ${name} successfully updated!`)
  })
}

/**
 * "Private method".
 * Logic of creating a new player entry.
 * @returns 
 */
const createNewPlayer = (name, score) => {
  const newPlayer = { player: name, score: score };
  subDB.collection("players").insertOne(newPlayer, (err, res) => {
    if (err) throw err;
    console.log(`Player ${name} successfully added!`)
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
