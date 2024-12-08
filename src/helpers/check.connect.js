"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECONDS = 5000;

//count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log("Number of connections", numConnection);
};

//check over load
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;

    // example maximum number of connections based on number of cores
    const maxConnection = numCores * 5;
    console.log(`memory usage:: ${memoryUsage / 1024 / 1024} MB`);
    console.log(`Active connections: ${numConnection}`);

    if (numConnection > maxConnection) {
      console.log("connection overload detected");
    }
  }, _SECONDS);
};

module.exports = {
  countConnect,
  checkOverload,
};
