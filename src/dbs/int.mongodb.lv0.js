"use strict";

const mongoose = require("mongoose");

const connectString =
  "mongodb+srv://xuanquoche:xbGxu3jxwbrzoEeK@shopdev.jdc20.mongodb.net/?retryWrites=true&w=majority&appName=shopDEV";
mongoose
  .connect(connectString)
  .then((_) => console.log("connected mongodb sucres"))
  .catch((err) => console.log("error connect"));

if (1 === 1) {
  mongoose.set("debug", true);
  mongoose.set("debug", { color: true });
}

module.exports = mongoose;
