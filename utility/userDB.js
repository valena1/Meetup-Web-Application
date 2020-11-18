const User = require("../model/user");

var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new mongoose.Schema({
  firstName: { type: String, default: "firstName" },
  lastName: { type: String, default: "lastName" },
  email: { type: String, default: "email" },
  password: {type: String, default: "password"}
});
let dbModel = mongoose.model("User", userSchema, "Users");

module.exports.getUsers = function () {
  return new Promise((resolve, reject) => {
    dbModel
      .find()
      .then((data) => {
        //TO DO: make list of User objects
        resolve(data);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end findAll users

module.exports.getUser = function (userEmail) {
  return new Promise((resolve, reject) => {
    dbModel
      .findOne({
        email: userEmail,
      })
      .exec()
      .then((data) => {
        //make user object and resolve
        let theUser = new User();
        theUser.setFirstName(data.firstName);
        theUser.setLastName(data.lastName);
        theUser.setEmail(data.email);
        theUser.setPassword(data.password);
        resolve(theUser);
      })
      .catch((err) => {
        return reject(err);
      });
  });
}; //end find user