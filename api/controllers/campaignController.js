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

    //Get the list of members in the current society
    const getMembers = `SELECT member_id FROM members WHERE society_id = ?`
    conn.query(getMembers, [society_id], function(error1, members) {
      if (error1) {
        return conn.rollback(() => {
          return res.send(error1);
        });
      }

      // Make a query for inserting a new campaign
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

          // use the campaign id to insert voters
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
  
                // this will determine the ids of the newly generated questions to be used for choice insertion
                const questionIds = [];
                for (
                  let i = result3.insertId;
                  i < result3.insertId + result3.affectedRows;
                  i++
                ) {
                  questionIds.push(i);
                }
  
                const insertBallotChoices = `INSERT INTO choices (campaign_id, question_id, name, bio, image_filepath, vote_count, choice_placement) VALUES ?`;
  
                let insertChoicesValues = [];
  
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

exports.submit_ballot = (req, res) => {
  const society_id = Number(req.body.society_id)
  const campaign_id = Number(req.body.campaign_id)
  const member_id = Number(req.body.member_id)
  const selections = req.body.selections
  console.log(req.body)

  conn.beginTransaction((err) => {
    if (err) {
      return res.send(err)
    }

    // First create the ballot entry
    const insertBallot = `INSERT INTO ballots (campaign_id, time_submitted, ballot_type) VALUES (?, ?, ?)`
    const ballotValues = [campaign_id, new Date(), 'DIGITAL']

    conn.query(insertBallot, ballotValues, function(error1, result1) {
      if (error1) {
        return conn.rollback(() => {
          return res.send(error1)
        })
      }

    // Then insert the choices
      const ballot_id = result1.insertId
      const insertSelections = `INSERT INTO question_selections (ballot_id, question_id, response_id) VALUES ?`
      const ballotSelections = selections.map((selection) => {
        return [ballot_id, selection.question_id, selection.response_id]
      })

      conn.query(insertSelections, [ballotSelections], function(error2, result2) {
        if (error2) {
          return conn.rollback(() => {
            return res.send(error2)
          })
        }

        // Then update the vote count
        const updateCount = `UPDATE choices SET vote_count = vote_count + 1 WHERE response_id IN (?)`
        const countValues = selections.map((selection) => selection.response_id)

        conn.query(updateCount, [countValues], function(error3, result3) {
          if (error3) {
            return conn.rollback(() => {
              return res.send(error3)
            })
          }

          // Update the member's vote status
          const updateMember = `UPDATE campaign_voters SET voted = ?, voted_time = ? WHERE member_id = ? AND campaign_id = ? AND voted <> 'Y'`
          const memberValues = ["Y", new Date(), member_id, campaign_id]

          conn.query(updateMember, memberValues, function(error4, result4) {
            if (error4) {
              return conn.rollback(() => {
                return res.send(error4)
              })
            }

            // Increment the campaign's vote count
            const incrementVotes = `UPDATE campaigns SET vote_count = vote_count + 1 WHERE campaign_id = ?`
            conn.query(incrementVotes, [campaign_id], function(error5, result5) {
              if (error5) {
                return conn.rollback(() => {
                  return res.send(error5)
                })
              }

              conn.commit(function (commitError) {
                if (commitError) {
                  return conn.rollback(function () {
                    return res.send(commitError);
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
}

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

    conn.query(insertSociety, societyValues, function (error1, result1) {
      if (error1) {
        return conn.rollback(() => {
          return res.send(error1);
        });
      }

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
        // return res.send(result2)
      });
    });
  });
  //   return res.send(req.body);
};
