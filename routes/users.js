const auth = require("../middlewares/auth");
const { User, validate } = require("../models/user");
const _ = require("lodash");
const config = require("config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const cors = require("cors");

/* const User = mongoose.model(
  "Users",
  new mongoose.Schema({
    username: {
      type: String,
      maxlength: 50,
      email: true,
      required: true,
    },
    password: {
      type: String,
      minlength: 3,
      required: true,
    },
    name: {
      type: String,
      minlength: 3,
      maxlength: 25,
      required: true,
    },
    city: {
      type: String,
      minlength: 3,
      maxlength: 25,
      required: true,
    },
  })
); */

router.use(cors());

router.get("/me", auth, async (req, res) => {
  console.log("GET MY PROFFILE -- ", req.user._id);
  const users = await User.findById(req.user._id).select("-password");
  res.send(users);
});

router.get("/", async (req, res) => {
  console.log("GET THE LIST OF USERS");
  const users = await User.find().select("-password");
  res.send(users);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  /*  let user = new User({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    city: req.body.city,
  }); */

  let user = await User.findOne({ username: req.body.username });
  if (user) {
    console.log("User already registered! ---");
    return res.status(400).send("User already registered!");
  }

  user = new User({
    username: req.body.username,
    password: req.body.password,
    name: req.body.name,
    city: req.body.city,
  });
  //Use bcrypt to hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  user = await user.save();

  const token = user.generateAuthToken();

  /*  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["name"]))
    .send(user); */

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(user);

  // .header("access-control-expose-headers")
  //res.send(user);
  //send(_.pick(user, ["name"]))
  //res.send({ username: user.username, name: user.name, city: user.city });
});

router.put("/:id", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Use bcrypt to hash password
  //const salt = await bcrypt.genSalt(10);
  //const hashedPassword = await bcrypt.hash(req.body.password, salt);

  /* const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      city: req.body.city,
    },
    {
      new: true,
    }
  );
 */

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      password: req.body.password,
      name: req.body.name,
      city: req.body.city,
    },
    {
      new: true,
    }
  );

  if (!user) {
    return res.status(404).send("The user with the given ID was not found.");
  }

  //res.send(user);
  //res.send({ username: user.username, name: user.name, city: user.city });
  res.send(_.pick(user, ["username", "city", "name"]));
});

//----PATCH-------------------------------------------------------
router.patch("/:id", async (req, res) => {
  const { error } = validatePatch(req.body);
  if (error) return res.status(400).send("error.details[0].message");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      name: req.body.name,
      city: req.body.city,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return res.status(404).send("The user with the given ID was not found.");
  }
  res.send(_.pick(user, ["username", "city", "name"]));
});

//----PATCH PASSWORD CHANGE-------------------------------------------------------
router.patch("/password/:id", async (req, res) => {
  console.log("--password BE--");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //-------------------
  const { error } = validatePatchPassword(req.body);
  if (error) return res.status(400).send("error.details[0].message");

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: hashedPassword,
    },
    {
      new: true,
    }
  );
  if (!user) {
    return res.status(404).send("The user with the given ID was not found.");
  }

  const token = user.generateAuthToken();

  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(user);

  //res.send(_.pick(user, ["username", "city", "name"]));
});

router.delete("/:id", async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user) {
    return res.status(404).send("The user with the given ID was not found.");
  }
  // res.send(user);

  res.send(user);
});

router.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).send("The user with the given ID was not found.");
  }
  res.send(user);
});

function validatePatch(user) {
  const schema = {
    username: Joi.string().max(50).email().required(),
    name: Joi.string().min(3).max(25).required(),
    city: Joi.string().min(3).max(25).required(),
  };
  return Joi.validate(user, schema);
}

function validatePatchPassword(user) {
  const schema = {
    password: Joi.string().min(3).required(),
  };
  return Joi.validate(user, schema);
}

module.exports = router;
