const createError = require("http-errors");
const express = require("express");

const Connection = require("../model/connection");
const ConnectionDB = require("../utility/connectionDB");

const User = require("../model/user");
const userDB = require("../utility/userDB");

const UserProfile = require("../model/user-profile");
const userProfileDB = require("../utility/userProfileDB");

const UserConnection = require("../model/user-connection");

const router = express.Router();

const { check, validationResult } = require("express-validator");

let error = new Array(1);

/* GET /astronomy/login  */
router.post("/login", [
  check("username").isEmail().withMessage("Must be valid email.").normalizeEmail(),
  check("password").isLength({min: 8}).withMessage("Must be 8 or more characters.").matches(/^[a-zA-Z0-9!.?*]+$/i).withMessage("Can only contain letters, numbers, and special characters.")
], 
  async function (req, res, next) {

    console.log("request body details");
    console.log(req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(req.body.date);
      res.render("login", { errorlist: errors.array()});
      return;
    } 

  console.log("Username: " + req.body.username); 
  console.log("Password: " + req.body.password);

  await intializeSessionVariable(req, res);
  let data = {
    userProfile: req.session.userProfile,
  };

  // if username is incorrect 
  if (req.body.username != data.userProfile._user._email) {
    res.render("login", {errorlist: errors.array()});
    console.log("username is incorrect");
    return;
  } 

  // if password is incorrect
  if (req.body.password != data.userProfile._user._password) {
    res.render("login", {errorlist: errors.array()});
    console.log("password is incorrect");
    return;
  }

  console.log("session initialized with user profile data ");
  console.log(data.userProfile._user);
  res.render("savedConnections_1", {
    theUser: data.userProfile._user,
    userConnections: data.userProfile._userConnections,
  });
});

/* mount middleware to check for session data */
router.use("/", function (req, res, next) {
  console.log("test astronomy/myConnections ");
  //checking if session is already created
  if (!req.session.theUser) {
    //session doesn't exit route to login
    res.render("login");
  } else {
    // session exists go to next in the call stack
    next();
  }
});

/* GET /astronomy/myconnections  */
router.get("/", function (req, res) {
  console.log("request to astronomy/myConnections ");

  let data = {
    userProfile: req.session.userProfile,
  };
  res.render("savedConnections_1", {
    theUser: data.userProfile._user,
    userConnections: data.userProfile._userConnections,
  });
});

/* POST /astronomy/myconnections/login  */
router.post("/login",
function (req, res, next) {
  console.log("request body details");
  console.log(req.body);

  console.log("in login");

  intializeSessionVariable(req, res);

  let data = {
    userProfile: req.session.userProfile,
  };
  console.log("session initialized");
  console.log(data);
  res.render("savedConnections_1", {
    theUser: data.userProfile.user,
    userConnections: data.userProfile.userConnections,
  });
});

/* POST /astronomy/myconnections  */
router.post("/rsvp", async function (req, res) {
  let code = req.body.connectionId;

  let rsvp = "";

  if (
    req.body.rsvp.toUpperCase() == "YES" ||
    req.body.rsvp.toUpperCase() == "NO" ||
    req.body.rsvp.toUpperCase() == "MAYBE"
  ) {
    rsvp = req.body.rsvp;
  }

  try {
    let userProfile = new UserProfile(
      req.session.userProfile._user,
      req.session.userProfile._userConnections
    );
    console.log("adding rsvp, profile before add");
    console.log(userProfile);
    let connectionDB = new ConnectionDB();
    let connection = await connectionDB.getConnection(code);
    userProfile.addConnection(connection, rsvp);
    console.log("adding rsvp, profile after add");
    console.log(userProfile);

    req.session.userProfile = userProfile;
    res.render("savedConnections_1", {
      theUser: req.session.userProfile._user,
      userConnections: req.session.userProfile._userConnections,
    });
  } catch (e) {
    console.log(e);
    error.push(404);
    res.redirect("/astronomy/connections");
  }
});

/* POST /astronomy/delete  */
router.post("/delete", async function (req, res, next) {
  let code = req.body.connectionId;
  if (req.session.theUser) {
    try {
      let userProfile = new UserProfile(
        req.session.userProfile._user,
        req.session.userProfile._userConnections
      );
      let connection = await new ConnectionDB().getConnection(code);
      userProfile.removeConnection(connection);
      req.session.userProfile = userProfile;
      res.render("savedConnections_1", {
        theUser: req.session.userProfile._user,
        userConnections: req.session.userProfile._userConnections,
      });
    } catch (e) {
      error.push(404);
      res.redirect("/astrnomy/connections");
    }
  } else {
    intializeSessionVariable(req, res);
  }
});

/* GET /astronomy/signout  */
router.get("/signout", function (req, res, next) {
  req.session.destroy();
  res.render("index", { title: "Home", theUser: undefined });
});

/* GET /astronomy/newConnection  */
router.get("/newConnection", function (req, res, next) {
  if (!req.session.theUser) {
    intializeSessionVariable(req, res);
  }
  res.render("newConnection", {
    title: "Home",
    theUser: req.session.userProfile._user,
  });
});

/* GET /astronomy/myconnections/*  */
router.get("/*", function (req, res, next) {
  res.render("index", { title: "Home", theUser: req.session.theUser });
});

// initialzing session data
async function intializeSessionVariable(req, res) {
  //get username from request
  let username = req.body.username;

  //get user from database
  let user = await userDB.getUser(username);
  console.log(user);

  // get userprofile from databse
  userProfileConnections = await userProfileDB.selectUserConnections(
    user._email
  );

  // create UserProfile object
  let userProfile = new UserProfile();

  let userConnectionList = new Array();

  // create user connections for view (include connection details)
  if (userProfileConnections.length >= 1) {
    userConnectionList = await makeProfileConnectionsForView(
      userProfileConnections
    );
  }

  userProfile.setUser(user);
  userProfile.setUserConnections(userConnectionList);

  //creating session variable/property and storing a User in it
  req.session.theUser = user;

  // creating session variable/property and storing UserProfile object in it
  req.session.userProfile = userProfile;
}

async function makeProfileConnectionsForView(userConnections) {
  let userConnectionsArr = [];
  let theConnection;
  const connectionDB = new ConnectionDB();

  await asyncForEach(userConnections, async (element) => {
    try {
      theConnection = await connectionDB.getConnection(element.connection);
    } catch {
      console.log("error in fetching connection");
    }

    userConnection = new UserConnection(theConnection, element.rsvp);

    userConnectionsArr.push(userConnection);
  });
  return userConnectionsArr;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

module.exports = router;
