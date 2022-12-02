module.exports = (app) => {
  const router = require("express").Router();
  const conn = require("../models/db.js");
  const controller = require("../controllers/campaignController");

  router.get("/test", function (req, res) {
    return res.send({ message: "Test passsed" });
  });

  // Create society
  // TESTED
  router.post("/society", function (req, res) {
    const sql =
      "INSERT INTO society (name, member_count, auth1_name, auth2_name) VALUES (?, ?, ?, ?)";

    if (req.body.member_count <= 0) {
      return res.send({ error: "Society must have at least 1 member" });
    }

    const values = [
      req.body.name,
      req.body.member_count,
      req.body.auth1_name,
      req.body.auth2_name,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send({ error: err });
      }

      return res.send(result);
    });
  });

  //Get society
  // TESTED
  router.get("/society", function (req, res) {
    const sql =
      "SELECT society.name, society.member_count, society.auth1_name, society.auth2_name FROM society WHERE society_id = ?";
    const value = req.body.society_id;

    conn.query(sql, value, function (err, result) {
      if (err) {
        return res.send({ error: err });
      }

      if (result.length > 0) {
        return res.send(result);
      }

      return res.send({ error: "No societies found" });
    });
  });

  /*
    Get society auth labels
  */
  router.get("/authname/:society_id", function (req, res) {
    const sql = 
      "SELECT society.auth1_name, society.auth2_name FROM society WHERE society_id = ?";
    const value = [req.params.society_id];

    conn.query(sql, value, function (err, result) {
      if (err) {
        return res.send(err);
      }

      return res.send(result)
    });
  });

  // List all societies
  router.get("/societies", function (req, res) {
    const sql =
      "SELECT society.society_id, society.name, society.member_count, society.auth1_name, society.auth2_name FROM society";

    conn.query(sql, [], function (err, result) {
      if (err) {
        return res.send(err);
      }
      
      return res.send(result);
    });
  });

  router.get("/societies/:society_id", function (req, res) {
    const query = `SELECT society.society_id, society.name, society.member_count, society.auth1_name, society.auth2_name FROM society WHERE society.society_id = ?`;
    const values = [req.params.society_id];

    conn.query(query, values, function (err, result) {
      if (err) {
        return res.send(err);
      }

      return res.send(result);
    });
  });

  //Update society
  router.put("/society", function (req, res) {
    const sql =
      "UPDATE society SET society.name = ?, society.member_count = ?, society.auth1_name = ?, society.auth2_name = ? WHERE society_id = ?";
    const values = [
      req.body.name,
      req.body.member_count,
      req.body.auth1_name,
      req.body.auth2_name,
      req.body.society_id,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) res.send({ error: err });
      res.send(result);
    });
  });

  // Create campaign
  // CHECKED
  router.post("/campaign", function (req, res) {
    const start = new Date(req.body.start_time);
    const end = new Date(req.body.end_time);

    if (start >= end) {
      return res.send({ error: "Start time can not be after end time" });
    }

    console.log(req.body);

    const sql =
      "INSERT INTO campaigns (society_id, name, start_time, end_time, active, vote_count) VALUES (?,?,?,?,?,?)";
    const values = [
      req.body.society_id,
      req.body.name,
      req.body.start_time,
      req.body.end_time,
      "N",
      0,
    ];

    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send({ error: err });
      }
      return res.send(result);
    });
  });

  // Get campaing information
  router.get("/campaign/info/:campaign_id", function (req, res) {
    const sql =
      "SELECT campaigns.name, society.name AS 'society_name', campaigns.start_time, campaigns.end_time, campaigns.vote_count, campaigns.active FROM campaigns JOIN society USING (society_id) WHERE campaign_id = ?";
    const values = [req.params.campaign_id];
    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send({ error: err });
      }
      return res.send(result);
    });
  });

  //Update campaign
  router.put("/campaign/info", function (req, res) {
    const sql =
      "UPDATE campaign SET campaign.name = ?, campaign.start_time = ?, campaign.end_time = ?, campaign.vote_count = ?, campaign.active = ? WHERE campaign_id = ? AND society_id = ?";
    const values = [
      req.body.name,
      req.body.start_time,
      req.body.end_time,
      req.body.vote_count,
      req.body.campaign_active,
      req.body.campaign_id,
      req.body.society_id,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send({ error: err });
      }
      return res.send(result);
    });
  });

  // View campaign list
  router.get("/campaigns", function (req, res) {
    const sql =
      "SELECT active, campaign_id, end_time, start_time, campaigns.name, society.name AS society_name, society_id, vote_count FROM campaigns JOIN society USING(society_id)";
    conn.query(sql, [], function (err, result) {
      if (err) {
        console.log(err);
        return res.send({ error: err });
      }
      res.send(result);
    });
  });

  /*
    Sign-on route for clients, or non-admin users.
  */
  router.post("/signin", function (req, res) {
    const password = req.body.auth2;
    const value = req.body.auth1;

    const sql =
      "SELECT members.member_id, members.auth2 FROM members WHERE members.auth1 = ?";
    conn.query(sql, value, function (err, results) {
      if (err) {
        return res.status(502).send();
      }

      if (results.length === 0) {
        return res.status(401).send()
      }

      else if (password === results[0].auth2) {
        return res.send({user: results[0].member_id})
      }

      else {
        return res.status(401).send();
      } 
    });
  });

  /*
    Sign-on route for admin users
  */
  router.post("/admin", function (req, res) {
    const password = req.body.auth2;
    const value = req.body.auth1;

    const sql =
      "SELECT members.member_id, members.auth2 FROM members WHERE members.auth1 = ? AND members.admin = 'Y'";
    conn.query(sql, value, function (err, results) {
      if (err) {
        return res.status(502).send();
      }

      if (results.length === 0) {
        return res.status(401).send()
      }

      else if (password === results[0].auth2) {
        return res.send({user: results[0].member_id})
      }

      else {
        return res.status(401).send();
      } 
    });
  });

  // Create Member
  // CHECKED
  router.post("/members", function (req, res) {
    const sql =
      "INSERT INTO members (name, admin, auth1, auth2) VALUES (?, ?, ?, ?)";
    const values = [
      req.body.name,
      req.body.admin,
      req.body.auth1,
      req.body.auth2,
    ];

    conn.query(sql, values, function (err, result) {
      if (err) res.send({ error: err });
      return res.send(result);
    });
  });

  //Get Member Info
  // CHECKED
  router.get("/members", function (req, res) {
    const sql =
      "SELECT members.name, members.admin FROM members WHERE member_id = ?";
    const value = req.body.member_id;

    conn.query(sql, value, function (err, result) {
      if (err) res.send({ error: err });
      if (result.length > 0) {
        return res.send(result);
      }

      return res.send({ error: "No users found" });
    });
  });

  //Update Member
  router.put("/members", function (req, res) {
    const sql =
      "UPDATE members SET members.name = ?, members.admin = ?, members.auth1 = ?, members.auth2 = ? WHERE members.member_id = ?";
    const values = [
      req.body.name,
      req.body.admin,
      req.body.auth1,
      req.body.auth2,
      req.body.member_id,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) res.send({ error: err });
      res.send("Updated a member.");
    });
  });

  //Get Votes
  router.get("/ballot_choices", function (req, res) {
    const sql =
      "SELECT choice_id, vote_count FROM ballot_choices WHERE campaign_id = ? AND question_id = ? AND response_id = ?";
    const value = [
      req.body.campaign_id,
      req.body.question_id,
      req.body.response_id,
    ];
    conn.query(sql, value, function (err, result) {
      if (err) res.send({ error: err });
      res.send(result);
    });
  });

  //Add Votes
  router.post("/ballot_choices", function (req, res) {
    const sql = "UPDATE ballot_choices SET vote_count = ? WHERE choice_id = ?";
    const values = [req.body.vote_count, req.body.choice_id];
    conn.query(sql, values, function (err, result) {
      if (err) {
        res.send({ error: err });
      }
      return res.send("Added votes");
    });
  });

  // Update choice placement
  router.put("/choice", function (req, res) {
    const sql1 =
      "UPDATE choices SET choices.name = ?, choices.title = ?, choices.bio = ?, choices.image_filepath = ? WHERE response_id = ?";
    const sql2 =
      "UPDATE ballot_choices SET choice_placement = ? WHERE campaign_id = ? AND question_id = ? AND response_id = ? AND choice_id = ?";
    const values1 = [
      req.body.name,
      req.body.title,
      req.body.bio,
      req.body.filepath,
      req.body.response_id,
    ];
    const values2 = [
      req.body.choice_placement,
      req.body.campaign_id,
      req.body.question_id,
      req.body.response_id,
      req.body.choice_id,
    ];
    let res1, res2;

    conn.query(sql1, values1, function (err, result) {
      if (err) return res.send({ error: err });
      res1 = result;
    });

    conn.query(sql2, values2, function (err, result) {
      if (err) return res.send({ error: err });
      res2 = result;
    });

    if (res1 & res2) {
      res.send({ ...res1, ...res2 });
    }
  });

  // Get choice info
  router.get("/choice/info", function (req, res) {
    const sql =
      "SELECT choices.name, choices.title, choices.bio, choices.image_filepath FROM choices WHERE response_id = ?";
    const value = req.body.response_id;
    conn.query(sql, value, function (err, result) {
      if (err) return res.send({ error: err });
      return res.send(result);
    });
  });

  // Get question choice info
  router.get("/question/choice/info", function (req, res) {
    const sql =
      "SELECT choices.name, choices.title, choices.bio, choices.image_filepath, ballot_choices.choice_placement FROM choices JOIN ballot_choices USING(response_id) WHERE response_id = ? AND campaign_id = ?, and question_id = ?, and choice_id = ?";
    const values = [
      req.body.response_id,
      req.body.campaign_id,
      req.body.question_id,
      req.body.choice_id,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) return res.send({ error: err });
      res.send(result);
    });
  });

  // Declare Vote
  router.post("/campaign/voters", function (req, res) {
    const sql =
      "UPDATE campaign_voters SET voted = ?, voted_time = ? WHERE member_id = ? AND campaign_id = ?";
    const values = [
      req.body.voted,
      req.body.voted_time,
      req.body.member_id,
      req.body.campaign_id,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send(err);
      }
      return res.send("Declared votes");
    });
  });

  // Create Question
  router.post("/ballot/questions", function (req, res) {
    const sql = "INSERT INTO ballot_questions VALUES (?,?,?,?,?)";
    const values = [
      req.body.campaign_id,
      req.body.question_id,
      req.body.question,
      req.body.maximum_selections,
      req.body.question_placement,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send(err);
      }

      return res.send("Question added");
    });
  });

  // Get Question Info
  router.get("/ballot/questions", function (req, res) {
    const sql =
      "SELECT ballot_questions.question, ballot_questions.maximum_selections, ballot_questions.question_placement FROM ballot_questions WHERE campaign_id = ? AND question_id = ?";
    const value = [req.body.campaign_id, req.body.question_id];
    conn.query(sql, value, function (err, result) {
      if (err) throw err;
      res.send(result);
    });
  });

  // Update Question
  router.post("/ballot/questions", function (req, res) {
    const sql =
      "UPDATE ballot_questions SET ballot_questions.question = ?, ballot_questions.maximum_selections = ?, ballot_questions.question_placement = ? WHERE campaign_id = ? AND question_id = ?";
    const values = [
      req.body.question,
      req.body.maximum_selections,
      req.body.question_placement,
      req.body.campaign_id,
      req.body.question_id,
    ];
    conn.query(sql, values, function (err, result) {
      if (err) {
        return res.send(err);
      }
      return res.send("Question updated");
    });
  });

  // Create Question Choice
  router.post("/choices", function (req, res) {
    const sql1 = "INSERT INTO choices VALUES (?,?,?,?,?)";
    const sql2 =
      "INSERT INTO ballot_choices (campaign_id, question_id, response_id, choice_id, choice_placement) VALUES (?,?,?,?,?)";
    const values1 = [
      req.body.response_id,
      req.body.name,
      req.body.title,
      req.body.bio,
      req.body.image_filepath,
    ];
    const values2 = [
      req.body.campaign_id,
      req.body.question_id,
      req.body.response_id,
      req.body.choice_id,
      req.body.choice_placement,
    ];
    conn.query(sql1, values1, function (err, result) {
      if (err) {
        return res.send(err);
      }
      console.log("Added a choice.");
    });
    conn.query(sql2, values2, function (err, result) {
      if (err) {
        return res.send(err);
      }
      console.log("Added choice placement.");
    });
  });

  // Add ballot
  router.post("/ballot", function (req, res) {
    const sql1 =
      "INSERT INTO ballots (campaign_id, time_submitted, ballot_type) VALUES (?,?,?)";
    const sql2 =
      "SELECT ballots.ballot_id FROM ballots WHERE campaign_id = ? AND time_submitted = ? AND ballot_type = ?;";
    const values = [
      req.body.campaign_id,
      req.body.time_submitted,
      req.body.type,
    ];
    conn.beginTransaction((err) => {
      if (err) {
        res.send({ error: err });
      }

      // Make the new ballot
      conn.query(sql1, values, function (error, result) {
        if (error) {
          return conn.rollback(() => res.send({ error: error }));
        }
      });

      // Get the new ballot
      conn.query(sql2, values, function (error, result) {
        if (error) {
          return conn.rollback(() => res.send({ error: error }));
        }
        conn.commit(function (commitError) {
          if (commitError) {
            return conn.rollback(function () {
              res.send({ error: commitError });
            });
          }
          res.send(result);
        });
      });
    });
  });

  // Add votes
  router.post("/votes", function (req, res) {
    const sql1 =
      "SELECT ballot_choices.vote_count FROM ballot_choices WHERE choice_id = ?;";
    const sql2 =
      "UPDATE ballot_choices SET vote_count = ? WHERE choice_id = ?;";
    const sql3 =
      "INSERT INTO question_selections (ballot_id, question_id, choice_id) VALUES (?,?,?);";
    const values1 = [req.body.choice_id];
    const values2 = [
      req.body.ballot_id,
      req.body.question_id,
      req.body.choice_id,
    ];

    conn.beginTransaction((err) => {
      if (err) {
        res.send({ error: err });
      }

      let currentCount;

      // Get the current count of the choice
      conn.query(sql1, values1, function (error1, result) {
        if (error1) {
          return conn.rollback(() => res.send({ error: error1 }));
        }
        currentCount = result;
      });
      currentCount++;

      // Increment the count of the choice
      conn.query(sql2, [currentCount, ...values1], function (error2, result) {
        if (error2) {
          return conn.rollback(() => res.send({ error: error2 }));
        }
      });

      conn.query(sql3, values2, function (error3, result) {
        if (error3) {
          return conn.rollback(() => res.send({ error: error3 }));
        }

        conn.commit(function (commitError) {
          if (commitError) {
            return conn.rollback(function () {
              res.send({ error: commitError });
            });
          }
          res.send(result);
        });
      });
    });
  });

  // Get campaign results
  router.get("/campaign/results/:campaignId", function (req, res) {
    const values = [req.params.campaignId];
    const query = `SELECT 
      ballot_questions.question_id, ballot_questions.question_placement, question, maximum_selections, choices.response_id, choices.name, choices.title, choices.bio, choices.image_filepath, choices.vote_count, choices.choice_placement 
      FROM ballot_questions
      JOIN choices USING (question_id, campaign_id)
      JOIN campaigns USING (campaign_id)
      WHERE campaign_id = ?;`;

    conn.query(query, values, function (error, result) {
      if (error) {
        return res.send({ error: error });
      }

      return res.send(result);
    });
  });

  // Create new campaign with ballot and questions
  router.post("/campaign/generate", controller.generate_campaign);

  // Create a society with members
  router.post("/society/generate", controller.generate_society);

  // Submit a user ballot
  router.post("/ballot/submit", controller.submit_ballot)

  // Get society's campaigns
  router.get(
    "/societies/campaigns/:society_id",
    controller.getSocietyCampaigns
  );

  router.put("/activate", controller.toggle_campaign)

  // Get member's available campaigns
  router.get("/campaigns/:society_id/:member_id", controller.getMemberCampaigns)

  app.use("/api", router);
};
