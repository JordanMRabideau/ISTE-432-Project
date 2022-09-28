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
            req.body.society_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            res.send(result)
        })
    })

    // Create campaign
    router.post("/campaign_info", function(req, res) {
        const sql = "INSERT INTO campaigns (society_id, campaign_id, name, start_time, end_time, active) VALUES (?,?,?,?,?,?)";
        const values = [
            req.body.society_id,
            req.body.campaign_id,
            req.body.name,
            req.body.start_time,
            req.body.end_time,
            req.body.active
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            res.send(result)
        })
    })

    // Get campaing information
    router.get("/campaign_info", function(req, res) {
        const sql = "SELECT campaigns.name, campaigns.start_time, campaigns.end_time, campaigns.vote_count, campaigns.active FROM campaigns WHERE campaign_id = ? AND society_id = ?";
        const values = [
            req.body.campaign_id,
            req.body.society_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            res.send(result)
        })
    })

    //Update campaign
    router.put("/campaign_info", function(req, res) {
        const sql = "UPDATE campaign SET campaign.name = ?, campaign.start_time = ?, campaign.end_time = ?, campaign.vote_count = ?, campaign.active = ? WHERE campaign_id = ? AND society_id = ?";
        const values = [
            req.body.name,
            req.body.start_time,
            req.body.end_time,
            req.body.vote_count,
            req.body.campaign_active,
            req.body.campaign_id,
            req.body.society_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            res.send(result)
        })
    })

    //Create Member
    router.post("/members", function(req, res) {
        const sql = "INSERT INTO members VALUES (?, ?, ?, ?, ?)";
        const values = [
            req.body.member_id,
            req.body.name,
            req.body.admin,
            req.body.auth1,
            req.body.auth2
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            console.log("Added a member.")
        })
    });

    //Get Member Info
    router.get("/members", function(req, res) {
        const sql = "SELECT members.name, members.admin FROM members WHERE member_id = ?";
        const value = req.body.member_id;

        conn.query(sql, value, function(err, result) {
            if (err) throw err;
            res.send(result)
        }) 
    })

    //Update Member
    router.put("/members", function(req, res) {
        const sql = "UPDATE members SET members.name = ?, members.admin = ?, members.auth1 = ?, members.auth2 = ? WHERE members.member_id = ?";
        const values = [
            req.body.name,
            req.body.admin,
            req.body.auth1,
            req.body.auth2,
            req.body.member_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            res.send("Updated a member.")
        })
    })

    //Get Votes
    router.get("/ballot_choices", function(req, res) {
        const sql = "SELECT choice_id, vote_count FROM ballot_choices WHERE campaign_id = ? AND question_id = ? AND response_id = ?";
        const value = [
            req.body.campaign_id,
            req.body.question_id,
            req.body.response_id
        ];
        conn.query(sql, value, function(err, result) {
            if (err) throw err;
            res.send(result)
        }) 
    })

    //Add Votes
    router.post("/ballot_choices", function(req, res) {
        const sql = "UPDATE ballot_choices SET vote_count = ? WHERE choice_id = ?";
        const values = [
            req.body.vote_count,
            req.body.choice_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            console.log("Added votes.")
        })
    });


    app.use('/api', router)
}