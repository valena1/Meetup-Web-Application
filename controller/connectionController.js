/**
 * Module dependencies.
 */

const express = require("express");
const Connection = require("../model/connection");
const ConnectionDB = require("../utility/connectionDB");

const UserConnection = require("../model/user-connection");

const UserProfile = require("../model/user-profile");

const router = express.Router();

const { check, validationResult } = require("express-validator");

let error = new Array(1);

/* route handler for main connections page.
 * and handles query string for connection
 * ALL HTTP methods (GET/POST/...) /astronomy/connections
 */
router.all("/connections", async function (req, res, next) {
  let connectionId = req.query.connectionId;
  console.log("testing");
  // validate data
  if (validateConnectionId(connectionId)) {
    try {
      console.log("valid id");

      const connectionDB = new ConnectionDB();

      // getting specific connection data object
      let connection = await connectionDB.getConnection(connectionId);

      let data = {
        connection: connection,
      };

      res.render("connection", { data: data });
    } catch (e) {
      error.push(404);
      res.redirect("connections");
    }
  } else {
    next();
  }
});

/* route handler for a connection page with param
 * ALL HTTP methods (GET/POST/...) /astronomy/connection
 */
router.all("/connection/:connectionId", async function (req, res, next) {
  let connectionId = req.params.connectionId;
  let connection;

  // validate data
  if (validateConnectionId(connectionId)) {
    try {
      let connectionDB = new ConnectionDB();
      // getting specific connection data object from DB
      connection = await connectionDB.getConnection(connectionId);

      let data = {
        connection: connection,
        theUser: req.session.theUser,
      };

      res.render("connection", { data: data, theUser: data.theUser });
    } catch (e) {
      error.push(404);
      res.redirect("/astronomy/connections");
    }
  } else {
    error.push(400);
    res.redirect("/astronomy/connections");
  }
});

router.post("/new", [
  check("topic").isLength({min: 3}).withMessage("Must be 3 or more characters.").trim().escape(),
  check("title").isLength({min: 3}).withMessage("Must be 3 or more characters.").trim().escape(),
  check("detail").isLength({min: 3}).withMessage("Must be 3 or more characters.").trim().escape(),
  check("where").isLength({min: 3}).withMessage("Must be 3 or more characters.").trim().escape(),
  check("when").isAfter()
],async function (req, res, next) {

  console.log("request body details");
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.body.date);
      res.render("newConnection", { errorlist: errors.array(), theUser: req.session.userProfile._user});
      return;
    } else {

  console.log("new connection");
  if (req.session.theUser) {
    let topic = req.body.topic;
    let title = req.body.title;
    let details = req.body.detail;
    let location = req.body.where;
    let date = req.body.when;

    console.log(topic);
    console.log(title);
    console.log(details);
    console.log(location);
    console.log(date);

    let userName =
      req.session.theUser.firstName + " " + req.session.theUser.lastName;

    let connectionDB = new ConnectionDB();
    let create = await connectionDB.createConnection(
      topic,
      title,
      details,
      location,
      date,
      userName,
      "logo.png"
    );

    console.log("new connection created");
    console.log(create);

    /////
    let userProfile = new UserProfile(
      req.session.userProfile._user,
      req.session.userProfile._userConnections
    );
    console.log("adding rsvp, profile before add");
    console.log(userProfile);
    let connection = await connectionDB.getConnection(create._connectionId);
    userProfile.addConnection(connection, "Yes");
    console.log("adding rsvp, profile after add");
    console.log(userProfile);

    req.session.userProfile = userProfile;
    res.render("savedConnections_1", {
      theUser: req.session.userProfile._user,
      userConnections: req.session.userProfile._userConnections,
    });
  }
}
});

// default for this controller is the connections view
router.all("/*", async function (req, res) {
  console.log("no valid connection id with request");
  let status = null;
  // get the topics from ConnectionDb
  const connectionDB = new ConnectionDB();
  let topics = await connectionDB.getTopics();

  // getting all connections from db and creating Connection data object and pushing to array.
  let connections = await connectionDB.getConnections();

  console.log("Topics and connections from DB");
  console.log(connections);
  console.log(topics);

  let data = {
    topics: topics,
    connections: connections,
    status: status,
  };

  // check of user in session to customize header
  if (req.session.theUser) {
    res.render("connections", {
      data: data,
      theUser: req.session.theUser,
    });
  } else {
    // no user session exists
    res.render("connections", { data: data });
  }
});

function validateConnectionId(connectionId) {
  if (connectionId !== undefined) {
    if (Number.isInteger(Number.parseInt(connectionId))) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

module.exports = router;
