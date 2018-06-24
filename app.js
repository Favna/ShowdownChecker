/* eslint-disable no-mixed-requires, sort-vars*/
const path = require('path'),
  ShowdownChecker = require(path.join(__dirname, 'ShowdownChecker')),
  start = function () {
    const app = new ShowdownChecker();

    app.run();
  };

start();