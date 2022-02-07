const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    maxlength: 50,
    unique: true,
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
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      username: this.username,
      name: this.name,
      city: this.city,
      password: this.password,
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    username: Joi.string().max(50).email().required(),
    password: Joi.string().min(3).required(),
    name: Joi.string().min(3).max(25).required(),
    city: Joi.string().min(3).max(25).required(),
  };
  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;
