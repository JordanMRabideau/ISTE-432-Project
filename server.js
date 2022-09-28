require('dotenv').config()
const express = require("express"),
  app = express(),
  port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const router = require("express").Router();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', function(req, res) {
  return res.send({error: true, message: 'hello'})
})

require("./api/routes/campaignRoutes.js")(app);
app.listen(port);

console.log("API server started on port: " + port);
