const connectionDB = require("./connectionDB");

const mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

const userConnectionSchema = new mongoose.Schema({
  //define the schema - this can take place of the model
  user: String,
  connection: Number,
  rsvp: String,
});
const dbModel = mongoose.model(
  "UserConnection",
  userConnectionSchema,
  "UserConnections"
);

module.exports.selectUserConnections = function (userID) {
  return new Promise((resolve, reject) => {
    dbModel
      .find({ user: userID })
      .then((data) => {
        console.log("in selectUserItems all " + data);
        resolve(data);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end findAll

// finds objects for the addStudent() function
module.exports.findByID = function (userID, connectionID) {
  return new Promise((resolve, reject) => {
    dbModel
      .find({
        $and: [{ user: userID }, { connection: connectionID }],
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end findByItemID

module.exports.updateConnection = function (userID, userConnection) {
  return new Promise((resolve, reject) => {
    dbModel
      .findOneAndUpdate(
        { $and: [{ user: userID }, { item: userConnection.item.code }] },
        {
          $set: {
            user: userID,
            item: userItem.item.code,
            rating: userConnection.rating,
            madeIt: userConnection.madeIt,
          },
        },
        { new: true, upsert: true },
        function (err, data) {
          console.log(data);
          resolve(data);
        }
      )
      .catch((err) => {
        return reject(err);
      });
  });
}; //end updateConnection

module.exports.updateRsvp = function (userID, connectionID, rsvp) {
  return new Promise((resolve, reject) => {
    dbModel
      .findOneAndUpdate(
        { $and: [{ user: userID }, { connection: connectionID }] },
        { $set: { rsvp: rsvp } },
        { new: true, upsert: true },
        function (err, data) {
          console.log(data);
          resolve(data);
        }
      )
      .catch((err) => {
        return reject(err);
      });
  });
}; ////end updateRsvp

// deletes this item

module.exports.remove = function (theUser, connectionID) {
  return new Promise((resolve, reject) => {
    dbModel
      .find({ $and: [{ user: theUser }, { connection: connectionID }] })
      .remove()
      .exec()
      .then(function () {
        resolve();
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end remove

/*module.exports.getNumberAttending = function (connectionID) {
  return new Promise((resolve, reject) => {
    dbModel
      .find({ $and: [{ connection: connectionID }, { rsvp: "Yes" }] })
      .then((data) => {
        console.log("in selectUserItems all " + data);
        resolve(data.length);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; */
//end getNumberAttending