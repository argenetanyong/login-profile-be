const { User } = require("../models/user");
const config = require("config");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(cors());

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  //Checks if the user or email exist
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).send("Invalid username");
  }
  //Checks if the password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).send("Invalid password");
  }
  //Generate JSON WEB TOKEN
  //Use config to hide details of jwtPrivateKey in environment variable
  const token = user.generateAuthToken();

  res.send(token);
});

function validate(req) {
  const schema = {
    username: Joi.string().max(50).email().required(),
    password: Joi.string().min(3).required(),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
