const mysql = require("mysql2");
require('dotenv').config();

// Create a connection to the local database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.PASSWORD,
    database: 'campaign_generator'
});

// Instantiate the connection
connection.connect(error => {
    if (error) throw error;
    console.log("Connected to database.")
});

module.exports = connection