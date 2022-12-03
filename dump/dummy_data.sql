USE Campaign_generator;

INSERT INTO society (name, member_count, auth1_name, auth2_name) VALUES ("Development Society", 6, "Member ID", "Password");

INSERT INTO campaigns (society_id, name, start_time, end_time, vote_count, active) VALUES (1, "Election", "2022-11-17 14:00:00", "2022-12-5 00:00:00", 0, "Y");

INSERT INTO members (society_id, name, admin, auth1, auth2) VALUES (1, "Stephen Zilora", "Y", "01", "zilora01");
INSERT INTO members (society_id, name, admin, auth1, auth2) VALUES (1, "Stephen Hawking", "N", "02", "hawking02");
INSERT INTO members (society_id, name, admin, auth1, auth2) VALUES (1, "Hidetaka Miyazaki", "N", "03", "miyazaki03");
INSERT INTO members (society_id, name, admin, auth1, auth2) VALUES (1, "Jordan Rabideau", "N", "04", "rabideau04");
INSERT INTO members (society_id, name, admin, auth1, auth2) VALUES (1, "Ryan Beach", "N", "05", "beach05");
INSERT INTO members (society_id, name, admin, auth1, auth2) VALUES (1, "Steffen Barr", "N", "06", "barr06");

INSERT INTO campaign_voters (member_id, campaign_id, voted, voted_time) VALUES (1, 1, "Y", "2022-11-18 10:30:00");
INSERT INTO campaign_voters (member_id, campaign_id, voted, voted_time) VALUES (2, 1, "Y", "2022-11-18 11:40:00");
INSERT INTO campaign_voters (member_id, campaign_id, voted, voted_time) VALUES (3, 1, "Y", "2022-11-18 16:00:00");
INSERT INTO campaign_voters (member_id, campaign_id, voted, voted_time) VALUES (4, 1, "Y", "2022-11-18 05:30:00");
INSERT INTO campaign_voters (member_id, campaign_id, voted, voted_time) VALUES (5, 1, "Y", "2022-11-18 10:22:00");
INSERT INTO campaign_voters (member_id, campaign_id, voted, voted_time) VALUES (6, 1, "Y", "2022-11-18 19:34:22");

INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (1, 1, "2022-11-18 10:30:00", "DIGITAL");
INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (2, 1, "2022-11-18 11:40:00", "DIGITAL");
INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (3, 1, "2022-11-18 16:00:00", "DIGITAL");
INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (4, 1, "2022-11-18 05:30:00", "DIGITAL");
INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (5, 1, "2022-11-18 10:22:00", "DIGITAL");
INSERT INTO ballots (ballot_id, campaign_id, time_submitted, ballot_type) VALUES (6, 1, "2022-11-18 19:34:22", "DIGITAL");

INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 1, 1, 1);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 1, 2, 3);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 1, 3, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 2, 1, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 2, 2, 1);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 2, 3, 3);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 3, 1, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 3, 2, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 3, 3, 1);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 4, 1, 3);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 4, 2, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 4, 3, 1);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 5, 1, 3);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 5, 2, 3);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 5, 3, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 6, 1, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 6, 2, 2);
INSERT INTO question_selections (campaign_id, ballot_id, question_id, response_id) VALUES (1, 6, 3, 2);

INSERT INTO ballot_questions (campaign_id, question, maximum_selections, question_placement) VALUES (1, "Secretary", 2, 1);
INSERT INTO ballot_questions (campaign_id, question, maximum_selections, question_placement) VALUES (1, "Warden", 1, 2);
INSERT INTO ballot_questions (campaign_id, question, maximum_selections, question_placement) VALUES (1, "President", 1, 3);
INSERT INTO ballot_questions (campaign_id, question, maximum_selections, question_placement) VALUES (1, "Janitor", 1, 4);

INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 1, "Gabe Newel", "Steam guy", "A web-interface dude", "./assets/images/image01.jpg", 1, 1);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 1, "Tim Cook", "Apple guy", "A wealthy dude", "./assets/images/image02.jpg", 3, 2);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 1, "David Munson", "1mil per year guy", "An EDM dude", "./assets/images/image03.jpg", 2, 3);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 2, "Wayne Lytle", "Animation guy", "An anti key-frame dude", "./assets/images/image04.jpg", 1, 1);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 2, "Bill Gates", "O.S. guy", "An GUI fan", "./assets/images/image05.jpg", 3, 2);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 2, "Elon Musk", "Chief Twit", "A Twitter bankruptor", "./assets/images/image06.jpg", 2, 3);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 3, "Jenson Huang", "Overpriced graphics unit guy", "An all the frames type of dude", "./assets/images/image07.jpg", 2, 1);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 3, "Stephen Zilora JR.", "Lil guy", "A pretty cool dude", "./assets/images/image08.jpg", 2, 2);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 3, "Charlie Murphy", "Ultimate slappie guy", "An interesting dude", "./assets/images/image09.jpg", 1, 3);
INSERT INTO choices (campaign_id, question_id, name, title, bio, image_filepath, vote_count, choice_placement) VALUES (1, 3, "Dan Mordaunt", "COD gamer", "Call of duty guy, loves to play for hours on end, only stops to eat, sleep, poop, and take medicine. He also loves the older generation consoles and lives most of his life pretending it's the early 2000s.", "./assets/images/image10.jpg", 1, 4);