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

    // Make a query for inserting a new query
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
      function (error1, result1) {
        if (error1) {
          return conn.rollback(() => {
            return res.send(error1);
          });
        }

        const campaign_id = result1.insertId;

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
          function (error2, result2) {
            if (error2) {
              return conn.rollback(() => {
                return res.send(error2);
              });
            }

            // this will determine the ids of the newly generated questions to be used for choice insertion
            const questionIds = [];
            for (
              let i = result2.insertId;
              i < result2.insertId + result2.affectedRows;
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
              function (error3, result3) {
                if (error3) {
                  return conn.rollback(() => {
                    return res.send(error3);
                  });
                }

                conn.commit(function (commitError) {
                  if (commitError) {
                    return conn.rollback(function () {
                      return res.send({ commitError });
                    });
                  }

                  return res.send(result3);
                });
              }
            );
          }
        );
      }
    );
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
  const society_id = Number(req.params.society_id)
  const campaign_id = Number(req.params.campaign_id)
  const member_id = Number(req.params.member_id)
  const selections = req.params.selections

  conn.beginTransaction((err) => {
    if (err) {
      return res.send(err)
    }

    // First create the ballot entry
    const insertBallot = `INSERT INTO ballots (campaign_id, time_submitted, ballot_type) VALUES (?, ?, ?)`
    const ballotValues = [campaign_id, Date.now(), 'DIGITAL']

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
        const updateCount = `UPDATE choices SET vote_count = vote_count + 1 WHERE response_id IN ?`
        const countValues = selections.map((selection) => selection.response_id)

        conn.query(updateCount, [countValues], function(error3, result3) {
          if (error3) {
            return conn.rollback(() => {
              return res.send(error3)
            })
          }

          // Finally update the member's vote status
          const updateMember = `UPDATE campaign_voters SET voted = ?, voted_time = ? WHERE member_id = ? AND campaign_id = ?`
          const memberValues = ["Y", Date.now(), member_id, campaign_id]

          conn.query(updateMember, memberValues, function(error4, result4) {
            if (error4) {
              return conn.rollback(() => {
                return res.send(error4)
              })
            }

            conn.commit(function (commitError) {
              if (commitError) {
                return conn.rollback(function () {
                  return res.send(commitError);
                });
              }
    
              return res.send(result4);
            });
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
