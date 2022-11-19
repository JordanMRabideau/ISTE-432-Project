const conn = require("../models/db.js");

exports.generate_campaign = (req, res) => {
    const society_id = req.body.society_id
    const campaign_name = req.body.name
    const start_time = req.body.start_time
    const end_time = req.body.end_time

    conn.beginTransaction((err) => {
        if (err) {
            return res.send(err)
        }

        // Make a query for inserting a new query
        const insertCampaign = 
            `INSERT INTO campaigns (society_id, name, start_time, end_time, vote_count, active) VALUES (?, ?, ?, ?, ?, ?)`
        
        const insertCampaignValues = [society_id, campaign_name, start_time, end_time, 0, "N"]
    
        // Insert the campaign and get the resulting ID
        conn.query(insertCampaign, insertCampaignValues, function(error1, result1) {
            if (error1) {
                return conn.rollback(() => {
                    return res.send(error1)
                })
            }

            const campaign_id = result1.insertId

            const insertBallotQuestions = 
            `INSERT INTO ballot_questions (campaign_id, question, maximum_selections, question_placement) VALUES ?`

            const insertQuestionsValues = req.body.questions.map((question) => {
                return [campaign_id, question.title, question.limit, question.position]
            })

            conn.query(insertBallotQuestions, [insertQuestionsValues], function(error2, result2) {
                if (error2) {
                    return conn.rollback(() => {
                        return res.send(error2)
                    })
                }

                // this will determine the ids of the newly generated questions to be used for choice insertion
                const questionIds = []
                for (let i = result2.insertId; i < result2.insertId + result2.affectedRows; i++) {
                    questionIds.push(i)
                }

                const insertBallotChoices = 
                `INSERT INTO choices (campaign_id, question_id, name, bio, image_filepath, vote_count, choice_placement) VALUES ?`

                let insertChoicesValues = [] 

                req.body.questions.forEach((question, questionIndex) => {
                    const newRow = [campaign_id, questionIds[questionIndex]]
                    const choiceInfo = question.choices.map((choice) => {
                        return [choice.name, choice.info, choice.image, 0, choice.position]
                    })
                    choiceInfo.forEach(choiceRow => {
                        insertChoicesValues.push(newRow.concat(...choiceRow))
                    })
                    console.log(insertChoicesValues)
                })
        
                conn.query(insertBallotChoices, [insertChoicesValues], function(error3, result3) {
                    if (error3) {
                        return conn.rollback(() => {
                            return res.send(error3)
                        })
                    }
        
                    conn.commit(function (commitError) {
                        if (commitError) {
                            return conn.rollback(function () {
                                return res.send({ commitError });
                            });
                        }
        
                        return res.send(result3)
                    })
                })
            })
        })
    })
}