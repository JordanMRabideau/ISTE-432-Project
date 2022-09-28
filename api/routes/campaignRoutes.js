module.exports = app => {
    const router = require("express").Router();
    const society = require("../controllers/campaignController")
    const conn = require("../models/db.js");

    router.get("/test", function(req, res) {
        return res.send({message: "Test passsed"})
    })

    router.post("/createSociety", function(req, res) {
        console.log(req)
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

    app.use('/api', router)
}