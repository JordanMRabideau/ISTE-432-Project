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
            if (err) res.send({error: err})
            console.log("Added a society.")
        })
    });

    //Get society
    router.get("/society", function(req, res) {
        const sql = "SELECT society.name, society.member_count, society.auth1_name, society.auth2_name FROM society WHERE society_id = ?";
        const value = req.body.society_id;

        conn.query(sql, value, function(err, result) {
            if (err) res.send({error: err})
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
            if (err) res.send({error: err})
            res.send(result)
        })
    })

    // Create campaign
    router.post("/campaign/info", function(req, res) {
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
            if (err) res.send({error: err})
            res.send(result)
        })
    })

    // Get campaing information
    router.get("/campaign/info", function(req, res) {
        const sql = "SELECT campaigns.name, campaigns.start_time, campaigns.end_time, campaigns.vote_count, campaigns.active FROM campaigns WHERE campaign_id = ? AND society_id = ?";
        const values = [
            req.body.campaign_id,
            req.body.society_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) res.send({error: err})
            res.send(result)
        })
    })

    //Update campaign
    router.put("/campaign/info", function(req, res) {
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
            if (err) res.send({error: err})
            res.send(result)
        })
    })

    // Sign in
    router.get("/signin", function(req, res) {
        const pass = req.body.auth2
        const sql = "SELECT members.member_id, members.auth2 FROM members WHERE members.auth1 = ?"
        const value = req.body.auth1
        conn.query(sql, value, function(err, results) {
            if (err) res.send({error: err})
            if (pass === results.auth2) res.send(results)
            else res.send({error: "Failed to log in"})
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
            if (err) res.send({error: err})
            console.log("Added a member.")
        })
    });

    //Get Member Info
    router.get("/members", function(req, res) {
        const sql = "SELECT members.name, members.admin FROM members WHERE member_id = ?";
        const value = req.body.member_id;

        conn.query(sql, value, function(err, result) {
            if (err) res.send({error: err})
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
            if (err) res.send({error: err})
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
            if (err) res.send({error: err})
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
            if (err) res.send({error: err})
            console.log("Added votes.")
        })
    });

    // Update choice placement
    router.put("/choice", function(req, res) {
        const sql1 = "UPDATE choices SET choices.name = ?, choices.title = ?, choices.bio = ?, choices.image_filepath = ? WHERE response_id = ?"
        const sql2 = "UPDATE ballot_choices SET choice_placement = ? WHERE campaign_id = ? AND question_id = ? AND response_id = ? AND choice_id = ?"
        const values1 = [
            req.body.name,
            req.body.title,
            req.body.bio,
            req.body.filepath,
            req.body.response_id
        ];
        const values2 = [
            req.body.choice_placement,
            req.body.campaign_id,
            req.body.question_id,
            req.body.response_id,
            req.body.choice_id
        ]
        let res1, res2;
        
        conn.query(sql1, values1, function(err, result) {
            if (err)  return res.send({error: err})
            res1 = result
        })

        conn.query(sql2, values2, function(err, result) {
            if (err)  return res.send({error: err})
            res2 = result
        })

        if (res1 & res2) {
            res.send({...res1, ...res2})
        }
    })

    // Get choice info
    router.get("/choice/info", function(req, res) {
        const sql = "SELECT choices.name, choices.title, choices.bio, choices.image_filepath FROM choices WHERE response_id = ?";
        const value = req.body.response_id
        conn.query(sql, value, function(err, result) {
            if (err)  return res.send({error: err})
            res.send(result)
        })
    })

    // Get question choice info
    router.get("/question/choice/info", function(req, res) {
        const sql = "SELECT choices.name, choices.title, choices.bio, choices.image_filepath, ballot_choices.choice_placement FROM choices JOIN ballot_choices USING(response_id) WHERE response_id = ? AND campaign_id = ?, and question_id = ?, and choice_id = ?";
        const values = [
            req.body.response_id,
            req.body.campaign_id,
            req.body.question_id,
            req.body.choice_id
        ]
        conn.query(sql, values, function(err, result) {
            if (err)  return res.send({error: err})
            res.send(result)
        })
    })

    // Declare Vote
    router.post("/campaign/voters", function(req, res) {
        const sql = "UPDATE campaign_voters SET voted = ?, voted_time = ? WHERE member_id = ? AND campaign_id = ?";
        const values = [
            req.body.voted,
            req.body.voted_time,
            req.body.member_id,
            req.body.campaign_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            console.log("Declared votes.")
        })
    });

    // Create Question
    router.post("/ballot/questions", function(req, res) {
        const sql = "INSERT INTO ballot_questions VALUES (?,?,?,?,?)";
        const values = [
            req.body.campaign_id,
            req.body.question_id,
            req.body.question,
            req.body.maximum_selections,
            req.body.question_placement
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            console.log("Added a question.")
        })
    });

    // Get Question Info
    router.get("/ballot/questions", function(req, res) {
        const sql = "SELECT ballot_questions.question, ballot_questions.maximum_selections, ballot_questions.question_placement FROM ballot_questions WHERE campaign_id = ? AND question_id = ?";
        const value = [
            req.body.campaign_id,
            req.body.question_id
        ];
        conn.query(sql, value, function(err, result) {
            if (err) throw err;
            res.send(result)
        }) 
    })

    // Update Question
    router.post("/ballot/questions", function(req, res) {
        const sql = "UPDATE ballot_questions SET ballot_questions.question = ?, ballot_questions.maximum_selections = ?, ballot_questions.question_placement = ? WHERE campaign_id = ? AND question_id = ?";
        const values = [
            req.body.question,
            req.body.maximum_selections,
            req.body.question_placement,
            req.body.campaign_id,
            req.body.question_id
        ];
        conn.query(sql, values, function(err, result) {
            if (err) throw err;
            console.log("Updated question.")
        })
    });

    // Create Question Choice
    router.post("/choices", function(req, res) {
        const sql1 = "INSERT INTO choices VALUES (?,?,?,?,?)";
        const sql2 = "INSERT INTO ballot_choices (campaign_id, question_id, response_id, choice_id, choice_placement) VALUES (?,?,?,?,?)";
        const values1 = [
            req.body.response_id,
            req.body.name,
            req.body.title,
            req.body.bio,
            req.body.image_filepath
        ];
        const values2 = [
            req.body.campaign_id,
            req.body.question_id,
            req.body.response_id,
            req.body.choice_id,
            req.body.choice_placement
        ];
        conn.query(sql1, values1, function(err, result) {
            if (err) throw err;
            console.log("Added a choice.")
        })
        conn.query(sql2, values2, function(err, result) {
            if (err) throw err;
            console.log("Added choice placement.")
        })
    });

    app.use('/api', router)
}