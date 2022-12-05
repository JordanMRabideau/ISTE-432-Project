-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema campaign_generator
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `campaign_generator` ;

-- -----------------------------------------------------
-- Schema campaign_generator
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `campaign_generator` DEFAULT CHARACTER SET utf8 ;
USE `campaign_generator` ;

-- -----------------------------------------------------
-- Table `campaign_generator`.`society`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`society` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`society` (
  `society_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `member_count` INT NULL DEFAULT NULL,
  `auth1_name` VARCHAR(45) NULL DEFAULT NULL,
  `auth2_name` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`society_id`),
  UNIQUE INDEX `society_id_UNIQUE` (`society_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`campaigns`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`campaigns` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`campaigns` (
  `campaign_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `society_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NULL DEFAULT NULL,
  `start_time` DATETIME NULL DEFAULT NULL,
  `end_time` DATETIME NULL DEFAULT NULL,
  `vote_count` INT NULL DEFAULT NULL,
  `active` ENUM('Y', 'N') NULL DEFAULT 'N',
  PRIMARY KEY (`campaign_id`, `society_id`),
  UNIQUE INDEX `campaign_id_UNIQUE` (`campaign_id` ASC) VISIBLE,
  INDEX `fk_campaigns_society1_idx` (`society_id` ASC) INVISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE,
  CONSTRAINT `fk_campaigns_society1`
    FOREIGN KEY (`society_id`)
    REFERENCES `campaign_generator`.`society` (`society_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`ballot_questions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`ballot_questions` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`ballot_questions` (
  `question_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` INT UNSIGNED NOT NULL,
  `question` LONGTEXT NULL DEFAULT NULL,
  `maximum_selections` INT NULL DEFAULT '1',
  `question_placement` INT NULL DEFAULT NULL,
  PRIMARY KEY (`question_id`, `campaign_id`),
  INDEX `fk_ballot_questions_campaigns1_idx` (`campaign_id` ASC) VISIBLE,
  CONSTRAINT `fk_ballot_questions_campaigns1`
    FOREIGN KEY (`campaign_id`)
    REFERENCES `campaign_generator`.`campaigns` (`campaign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`ballots`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`ballots` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`ballots` (
  `ballot_id` INT UNSIGNED NOT NULL,
  `campaign_id` INT UNSIGNED NOT NULL,
  `time_submitted` DATETIME NULL DEFAULT NULL,
  `ballot_type` ENUM('DIGITAL', 'PAPER') NULL DEFAULT NULL,
  PRIMARY KEY (`ballot_id`, `campaign_id`),
  INDEX `fk_ballots_campaigns1_idx` (`campaign_id` ASC) VISIBLE,
  CONSTRAINT `fk_ballots_campaigns1`
    FOREIGN KEY (`campaign_id`)
    REFERENCES `campaign_generator`.`campaigns` (`campaign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`members`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`members` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`members` (
  `member_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `society_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `admin` ENUM('Y', 'N') NULL DEFAULT 'N',
  `auth1` VARCHAR(80) NULL DEFAULT NULL,
  `auth2` VARCHAR(80) NULL DEFAULT NULL,
  PRIMARY KEY (`member_id`, `society_id`),
  UNIQUE INDEX `member_id_UNIQUE` (`member_id` ASC) VISIBLE,
  INDEX `fk_members_society1_idx` (`society_id` ASC) VISIBLE,
  CONSTRAINT `fk_members_society1`
    FOREIGN KEY (`society_id`)
    REFERENCES `campaign_generator`.`society` (`society_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`campaign_voters`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`campaign_voters` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`campaign_voters` (
  `voter_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `member_id` INT UNSIGNED NOT NULL,
  `campaign_id` INT UNSIGNED NOT NULL,
  `voted` ENUM('Y', 'N') NULL DEFAULT NULL,
  `voted_time` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`voter_id`, `member_id`, `campaign_id`),
  INDEX `fk_members_has_campaigns_campaigns1_idx` (`campaign_id` ASC) VISIBLE,
  INDEX `fk_members_has_campaigns_members_idx` (`member_id` ASC) VISIBLE,
  CONSTRAINT `fk_members_has_campaigns_campaigns1`
    FOREIGN KEY (`campaign_id`)
    REFERENCES `campaign_generator`.`campaigns` (`campaign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_members_has_campaigns_members`
    FOREIGN KEY (`member_id`)
    REFERENCES `campaign_generator`.`members` (`member_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`choices`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`choices` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`choices` (
  `response_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` INT UNSIGNED NOT NULL,
  `question_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(255) NULL DEFAULT NULL,
  `title` VARCHAR(45) NULL DEFAULT NULL,
  `bio` LONGTEXT NULL DEFAULT NULL,
  `image_filepath` VARCHAR(255) NULL DEFAULT NULL,
  `vote_count` INT NULL DEFAULT 0,
  `choice_placement` INT NULL,
  PRIMARY KEY (`response_id`, `campaign_id`, `question_id`),
  INDEX `fk_choices_ballot_questions1_idx` (`question_id` ASC, `campaign_id` ASC) VISIBLE,
  CONSTRAINT `fk_choices_ballot_questions1`
    FOREIGN KEY (`question_id` , `campaign_id`)
    REFERENCES `campaign_generator`.`ballot_questions` (`question_id` , `campaign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `campaign_generator`.`question_selections`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `campaign_generator`.`question_selections` ;

CREATE TABLE IF NOT EXISTS `campaign_generator`.`question_selections` (
  `question_selection_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `campaign_id` INT UNSIGNED NOT NULL,
  `ballot_id` INT UNSIGNED NOT NULL,
  `question_id` INT NOT NULL,
  `response_id` INT NOT NULL,
  PRIMARY KEY (`question_selection_id`, `ballot_id`, `campaign_id`),
  INDEX `fk_question_selections_ballots1_idx` (`ballot_id` ASC, `campaign_id` ASC) VISIBLE,
  CONSTRAINT `fk_question_selections_ballots1`
    FOREIGN KEY (`ballot_id`, `campaign_id`)
    REFERENCES `campaign_generator`.`ballots` (`ballot_id`, `campaign_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
