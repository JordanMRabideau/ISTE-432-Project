const express = require("express"),
  app = express(),
  port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const mysql = require("mysql");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.listen(port);

console.log("API server started on port: " + port);
