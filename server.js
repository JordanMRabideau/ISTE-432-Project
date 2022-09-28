require('dotenv').config()
const express = require("express"),
  app = express(),
  port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const mysql = require("mysql2");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get('/', function(req, res) {
  return res.send({error: true, message: 'hello'})
})

// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: process.env.PASSWORD,
//   database: 'book'
// });

// db.connect(error => {
//   if (error) throw error;
//   console.log("Connected to database.")
// });

require("./api/routes/campaignRoutes.js")(app);
app.listen(port);

console.log("API server started on port: " + port);
