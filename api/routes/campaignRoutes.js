module.exports = app => {
    const router = require("express").Router();
    const society = require("../controllers/campaignController")
    const conn = require("../models/db.js");

    router.get("/test", function(req, res) {
        return res.send({message: "Test passsed"})
    })

    // Create society
    router.post("/society", function(req, res) {
        const sql = "INSERT INTO society VALUES (?, ?, ?, ?, ?)";
        const values = [
            req.body.society_id,
            req.body.name,
            req.body.member_count,
            req.body.auth1_name,
            req.body.auth2_name
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            console.log("Added a society.")
        })
    });

    //Get society
    router.get("/society", function(req, res) {
        const sql = "SELECT society.name, society.member_count, society.auth1_name, society.auth2_name FROM society WHERE society_id = ?";
        const value = req.body.society_id;

        conn.query(sql, value, function(err, result) {
            if (err) throw err;
            res.send(result)
        }) 
    })

    //Update society
    router.put("/society", function(req, res) {
        const sql = "UPDATE society SET society.name = ?, society.member_count = ?, society.auth1_name = ?, society.auth2_name = ? WHERE society_id = ?";
        const values = [
            req.body.name,
            req.body.member_count,
            req.body.auth1_name,
            req.body.auth2_name,
            req.body.society_id,
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            res.send("Updated a society.")
        })
    })

    app.use('/api', router)
}