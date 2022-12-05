module.exports = (app) => {
  const router = require("express").Router();
  const conn = require("../models/db.js");
  const controller = require("../controllers/campaignController");

  router.get("/test", function (req, res) {
    return res.send({ message: "Test passsed" });
  });

  // Create society
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

  // Get society
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

  // Get society auth labels
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

  // Get information for single society
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

  // Update society
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

  // Get campaign information
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

  // Sign-on route for clients, or non-admin users.
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

  // Sign-on route for admin users
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

  // Get campaign results
  router.get("/campaign/results/:campaignId", function (req, res) {
    const values = [req.params.campaignId];
    const query = `SELECT 
      ballot_questions.question_id, campaigns.name AS campaign_name, campaigns.start_time, campaigns.end_time, ballot_questions.question_placement, question, maximum_selections, choices.response_id, choices.name, choices.title, choices.bio, choices.image_filepath, choices.vote_count, choices.choice_placement 
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

  router.post("/ballot/import", controller.submit_paper_ballot)

  // Get society's campaigns
  router.get(
    "/societies/campaigns/:society_id",
    controller.getSocietyCampaigns
  );

  // Update campaign active status
  router.put("/activate", controller.toggle_campaign)

  router.put("/campaign/edit", controller.edit_campaign)

  router.get("/campaign/results/:campaignId/:startBallot/:endBallot?", controller.get_result_sample)

  // Get member's available campaigns
  router.get("/campaigns/:society_id/:member_id", controller.getMemberCampaigns)

  app.use("/api", router);
};
