const conn = require("../models/db.js");

exports.generate_campaign = (req, res) => {
  const society_id = req.body.society_id;
  const campaign_name = req.body.name;
  const start_time = req.body.start_time;
  const end_time = req.body.end_time;

  conn.beginTransaction((err) => {
    if (err) {
      return res.send(err);
    }

    // Get a list of members in the current Society
    const getMembers = `SELECT member_id FROM members WHERE society_id = ?`
    conn.query(getMembers, [society_id], function(error1, members) {
      if (error1) {
        return conn.rollback(() => {
          return res.send(error1);
        });
      }

      // Query for inserting a new campaign to the database
      const insertCampaign = `INSERT INTO campaigns (society_id, name, start_time, end_time, vote_count, active) VALUES (?, ?, ?, ?, ?, ?)`;

      const insertCampaignValues = [
        society_id,
        campaign_name,
        start_time,
        end_time,
        0,
        "N",
      ];

      // Insert the campaign and get the resulting ID
      conn.query(
        insertCampaign,
        insertCampaignValues,
        function (error2, result1) {
          if (error2) {
            return conn.rollback(() => {
              return res.send(error2);
            });
          }

          // Use campaign_id to insert voters
          const campaign_id = result1.insertId;
          const insertVoters = `INSERT INTO campaign_voters (member_id, campaign_id, voted) VALUES ?`
          const voterValues = members.map((member) => {
            return [member.member_id, campaign_id, "N"]
          })

          conn.query(insertVoters, [voterValues], function(error3, result2) {
            if (error3) {
              return conn.rollback(() => {
                return res.send(error3);
              });
            }

            // Insert questions
            const insertBallotQuestions = `INSERT INTO ballot_questions (campaign_id, question, maximum_selections, question_placement) VALUES ?`;
            const insertQuestionsValues = req.body.questions.map((question) => {
              return [
                campaign_id,
                question.title,
                question.limit,
                question.position,
              ];
            });
  
            conn.query(
              insertBallotQuestions,
              [insertQuestionsValues],
              function (error4, result3) {
                if (error4) {
                  return conn.rollback(() => {
                    return res.send(error4);
                  });
                }
  
                // Determine the ID's of the newly generated questions. Will be used for insertion of choices
                const questionIds = [];
                for (
                  let i = result3.insertId;
                  i < result3.insertId + result3.affectedRows;
                  i++
                ) {
                  questionIds.push(i);
                }
                
                // Bulk insert of ballot choices
                const insertBallotChoices = `INSERT INTO choices (campaign_id, question_id, name, bio, image_filepath, vote_count, choice_placement) VALUES ?`;
  
                let insertChoicesValues = [];
                
                // Create list of values to be inserted to table for each choice
                req.body.questions.forEach((question, questionIndex) => {
                  const newRow = [campaign_id, questionIds[questionIndex]];
                  const choiceInfo = question.choices.map((choice) => {
                    return [
                      choice.name,
                      choice.info,
                      choice.image,
                      0,
                      choice.position,
                    ];
                  });
                  choiceInfo.forEach((choiceRow) => {
                    insertChoicesValues.push(newRow.concat(...choiceRow));
                  });
                  console.log(insertChoicesValues);
                });
  
                conn.query(
                  insertBallotChoices,
                  [insertChoicesValues],
                  function (error5, result4) {
                    if (error5) {
                      return conn.rollback(() => {
                        return res.send(error5);
                      });
                    }
  
                    conn.commit(function (commitError) {
                      if (commitError) {
                        return conn.rollback(function () {
                          return res.send({ commitError });
                        });
                      }
  
                      return res.send(result4);
                    });
                  }
                );
              }
            );

          })
        }
      );

    })
  });
};

// Get a society's campaigns
exports.getSocietyCampaigns = (req, res) => {
  const society_id = Number(req.params.society_id);
  const getCampaigns = `SELECT campaign_id, name, start_time, end_time, active, vote_count FROM campaigns WHERE society_id = ?`;

  conn.query(getCampaigns, [society_id], function (error, result) {
    if (error) {
      return res.send(error);
    }

    return res.send(result);
  });
};

// Get all active campaigns that a given user hasn't voted in
exports.getMemberCampaigns = (req, res) => {
  const society_id = Number(req.params.society_id);
  const member_id = Number(req.params.member_id);
  const getCampaigns = `SELECT campaign_id, name, start_time, end_time FROM campaigns JOIN campaign_voters USING (campaign_id) WHERE society_id = ? AND member_id = ? AND voted="N" AND active = "Y"`
  const values = [society_id, member_id]

  conn.query(getCampaigns, values, function(err, result) {
    if (err) {
      return res.send(err)
    }

    return res.send(result)
  })
}

// Import paper ballot submissions
exports.submit_paper_ballot = (req, res) => {

  const campaign_id = Number(req.body.campaign_id)
  const selections = req.body.selections

  conn.beginTransaction((err) => {
    if (err) {
      return res.send(err)
    }

    // Gather unique question ID's
    const ballotIds = []
    selections.forEach(s => {
      if (ballotIds.indexOf(s.ballot_id) == -1) {
        ballotIds.push(s.ballot_id)
      }
    })

    // Ignore duplicate ballot IDs and submit the rest
    const insertBallot = `INSERT IGNORE INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES ?`
    const ballotValues = ballotIds.map(b => [b, campaign_id, new Date(), "PAPER"])

    conn.query(insertBallot, [ballotValues], function(ballotError, ballots) {
      if (ballotError) {
        return conn.rollback(() => {
          return res.status(501).send(ballotError)
        })        
      }

      const added = ballots.affectedRows

      const insertSelections = `INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES ?`
      const ballotSelections = selections.map((selection) => {
        return [campaign_id, selection.ballot_id, selection.question_id, selection.response_id]
      })

      conn.query(insertSelections, [ballotSelections], function(selectionsError, response) {
        if (selectionsError) {
          return conn.rollback(() => {
            return res.status(501).send(selectionsError)
          })
        }

        // Get choices and count votes of each choice
        let choices = {}
        selections.forEach(s => {
          if (choices.hasOwnProperty(s.response_id)) {
            choices[s.response_id]++
          } else {
            choices[s.response_id] = 1
          }
        })

        // Iterating over choices object to update choice vote counts
        let updateCount = `UPDATE choices SET vote_count = (case`
        for (const choice in choices) {
          updateCount += ` when response_id = ${choice} then vote_count + ${choices[choice]}`
        }
        updateCount += ` end) WHERE response_id IN (?)`
        
        const countValues = selections.map((selection) => Number(selection.response_id))
        
        conn.query(updateCount, [countValues], function(countError, count) {
          if (countError) {
            return conn.rollback(() => {
              console.log(countError)
              return res.status(501).send(countError)
            })
          }

          // Increment the campaign's vote count
          const incrementVotes = `UPDATE campaigns SET vote_count = vote_count + ${added} WHERE campaign_id = ?`
          conn.query(incrementVotes, [campaign_id], function(voteError, vote) {
            if (voteError) {
              return conn.rollback(() => {
                return res.status(501).send(voteError)
              })
            }

            conn.commit(function (commitError) {
              if (commitError) {
                return conn.rollback(function () {
                  return res.status(501).send(commitError);
                });
              }
    
              return res.send({message: `Added ${added} ballots.`});
            });
          })
        })
      })

    })
  })
}

// Import web app ballot submissions
exports.submit_ballot = (req, res) => {
  const society_id = Number(req.body.society_id)
  const campaign_id = Number(req.body.campaign_id)
  const member_id = Number(req.body.member_id)
  const selections = req.body.selections

  conn.beginTransaction((err) => {
    if (err) {
      return res.send(err)
    }

    // Get last ballot id
    const getId = `SELECT MAX(ballot_id) AS last_id FROM ballots WHERE campaign_id = ?`
    conn.query(getId, [campaign_id], function(idErr, idResp) {
      if (idErr) {
        return conn.rollback(() => {
          console.log(idErr)
          return res.status(501).send(idErr)
        })
      }
      const id = idResp[0].last_id

      console.log(typeof id)
      console.log(id)
      const newId = id ? id++ : 1


      // First create the ballot entry
      const insertBallot = `INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (?, ?, ?, ?)`
      const ballotValues = [newId, campaign_id, new Date(), 'DIGITAL']
  
      conn.query(insertBallot, ballotValues, function(error1, result1) {
        if (error1) {
          return conn.rollback(() => {
            return res.status(501).send(error1)
          })
        }
  
        
        const insertSelections = `INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES ?`
        const ballotSelections = selections.map((selection) => {
          return [campaign_id, newId, selection.question_id, selection.response_id]
        })
  
        conn.query(insertSelections, [ballotSelections], function(error2, result2) {
          if (error2) {
            return conn.rollback(() => {
              return res.status(501).send(error2)
            })
          }
  
          // Then update the vote count
          const updateCount = `UPDATE choices SET vote_count = vote_count + 1 WHERE response_id IN (?)`
          const countValues = selections.map((selection) => selection.response_id)
  
          conn.query(updateCount, [countValues], function(error3, result3) {
            if (error3) {
              return conn.rollback(() => {

                return res.status(501).send(error3)
              })
            }
  
            // Update the member's vote status
            const updateMember = `UPDATE campaign_voters SET voted = ?, voted_time = ? WHERE member_id = ? AND campaign_id = ? AND voted <> 'Y'`
            const memberValues = ["Y", new Date(), member_id, campaign_id]
  
            conn.query(updateMember, memberValues, function(error4, result4) {
              if (error4) {
                return conn.rollback(() => {
                  return res.status(501).send(error4)
                })
              }
  
              // Increment the campaign's vote count
              const incrementVotes = `UPDATE campaigns SET vote_count = vote_count + 1 WHERE campaign_id = ?`
              conn.query(incrementVotes, [campaign_id], function(error5, result5) {
                if (error5) {
                  return conn.rollback(() => {
                    return res.status(501).send(error5)
                  })
                }
  
                conn.commit(function (commitError) {
                  if (commitError) {
                    return conn.rollback(function () {
                      return res.status(501).send(commitError);
                    });
                  }
        
                  return res.send(result5);
                });
              })
  
            })
            
          })

        })
      })
    })
  })
}

// Get campaign result sample
exports.get_result_sample = (req, res) => {
  const campaign_id = req.params.campaignId
  const start_ballot = req.params.startBallot
  const end_ballot = req.params.endBallot


  let values = [campaign_id]
  let query1
  
  // Range between ballot ID's, choices with votes
  if (end_ballot) {
    values.push(start_ballot, end_ballot)
    query1 = `SELECT ballots.campaign_id, ballots.ballot_id, question_selections.question_id, question_selections.response_id, question, question_placement, name, title, bio, choice_placement
      FROM ballots
      JOIN question_selections USING (ballot_id)
      RIGHT JOIN ballot_questions ON ballot_questions.question_id = question_selections.question_id
      JOIN choices ON choices.response_id = question_selections.response_id
      WHERE ballots.campaign_id = ?
      AND ballot_id BETWEEN ? AND ?`
  } else {
    // Particular ballot ID
    values.push(start_ballot)
    query1 = `SELECT ballots.campaign_id, COUNT(response_id) AS count, ballots.ballot_id, question_selections.question_id, question_selections.response_id, question, question_placement, name, title, bio, choice_placement
      FROM ballots
      JOIN question_selections USING (ballot_id)
      RIGHT JOIN ballot_questions ON ballot_questions.question_id = question_selections.question_id
      JOIN choices ON choices.response_id = question_selections.response_id
      WHERE ballots.campaign_id = ?
      AND ballot_id = ?`
  }

  conn.query(query1, values, function(error, response) {
    if (error) {
      console.log(error)
      return res.send(error)
    }

    // Results of campaign with all choices
    const query2 = `SELECT 
      ballot_questions.question_id, ballot_questions.question_placement, question, maximum_selections, choices.response_id, choices.name, choices.choice_placement 
      FROM ballot_questions
      JOIN choices USING (question_id, campaign_id)
      JOIN campaigns USING (campaign_id)
      WHERE campaign_id = ?;`

    conn.query(query2, [campaign_id], function(error2, result2) {
      if (error2) {
        return res.send(error2)
      }

      result2.forEach(item => {
        item.vote_count = 0
      })

      response.forEach(r => {
        const choice = result2.find(q => q.response_id === r.response_id)
        choice.vote_count++
      })

      return res.send(result2)
    })

  })
  


}

// Toggle whether a campaign is active or not
exports.toggle_campaign = (req, res) => {
  const campaign_id = req.body.campaign_id
  const active = req.body.enable == "true" ? "Y" : "N"
  const update = `UPDATE campaigns SET active = ? WHERE campaign_id = ?`
  const values = [active, campaign_id]

  conn.query(update, values, function(error, response) {
    if (error) {
      return res.send(error)
    }

    return res.send(response)
  })
}

// Create a new society
exports.generate_society = (req, res) => {
  const society_name = req.body.name;
  const auth1_name = req.body.auth1_name;
  const auth2_name = req.body.auth2_name;
  const members = req.body.members;
  const member_count = members.length;

  conn.beginTransaction((err) => {
    if (err) {
      return res.send(err);
    }

    const insertSociety = `INSERT INTO society (name, auth1_name, auth2_name, member_count) VALUES (?, ?, ?, ?)`;
    const societyValues = [society_name, auth1_name, auth2_name, member_count];

    // Insert the society
    conn.query(insertSociety, societyValues, function (error1, result1) {
      if (error1) {
        return conn.rollback(() => {
          return res.send(error1);
        });
      }

      // Insert members into the society
      const society_id = result1.insertId;
      const membersValues = members.map((mem) => {
        return [society_id, ...mem];
      });
      const insertMembers = `INSERT INTO members (society_id, name, auth1, auth2, admin) VALUES ?`;

      conn.query(insertMembers, [membersValues], function (error2, result2) {
        if (error2) {
          return conn.rollback(() => {
            return res.send(error2);
          });
        }

        conn.commit(function (commitError) {
          if (commitError) {
            return conn.rollback(function () {
              return res.send(commitError);
            });
          }

          return res.send(result2);
        });
      });
    });
  });

};
