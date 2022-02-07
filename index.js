const config = require("config");
const mongoose = require("mongoose");
const users = require("./routes/users");
const auth = require("./routes/auth");
const express = require("express");
const app = express();

if (!config.get("jwtPrivateKey")) {
  console.error("JWT no defined");
  process.exit(1);
}

//Mongodb connection local
/* mongoose
  .connect("mongodb://localhost/login-profile-db")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...")); */

// mongodb connection string should be set in the environment variable
// The hardcoded connection string is for portfolio/demo purpose only

mongoose
  .connect(
    "mongodb://logan:14344@cluster0-shard-00-00.mfkia.mongodb.net:27017,cluster0-shard-00-01.mfkia.mongodb.net:27017,cluster0-shard-00-02.mfkia.mongodb.net:27017/login-profile-db?ssl=true&replicaSet=atlas-cvlux3-shard-0&authSource=admin&retryWrites=true&w=majority"
  )
  .then(() => console.log("Connected to REMOTE MongoDB..."))
  .catch((err) => console.error("Could not connect to REMOTE MongoDB..."));

app.use(express.json());
app.use("/api/users", users);
app.use("/api/auth", auth);

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port ${port}...`));
