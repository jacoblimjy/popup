CREATE DATABASE IF NOT EXISTS vrc;
USE vrc;

CREATE TABLE Roles (
    role_id INTEGER PRIMARY KEY,
    role_name VARCHAR(255)
);

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    role_id INTEGER,
    username VARCHAR(255),
    email VARCHAR(255),
    password_hash VARCHAR(255),
    date_created TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

CREATE TABLE Children (
    child_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    user_id INTEGER,
    child_name VARCHAR(255),
    age INTEGER CHECK (age BETWEEN 1 AND 100),
    education_level INTEGER DEFAULT 1,
    date_created TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE -- if user is deleted, delete all their children
);

CREATE TABLE Topics (
    topic_id INTEGER PRIMARY KEY,
    topic_name VARCHAR(255),
    topic_description TEXT
);

CREATE TABLE Difficulty_Levels (
    difficulty_id INTEGER PRIMARY KEY,
    label VARCHAR(255),
    numeric_level INTEGER
);

CREATE TABLE Questions (
    question_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT,
    answer_format VARCHAR(255),
    correct_answer TEXT,
    distractors JSON,
    topic_id INTEGER,
    difficulty_id INTEGER,
    explanation TEXT,
    date_created TIMESTAMP,
    last_modified TIMESTAMP,
    is_llm_generated BOOLEAN,
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id),
    FOREIGN KEY (difficulty_id) REFERENCES Difficulty_Levels(difficulty_id)
);

CREATE TABLE Pending_Questions (
    pending_question_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT,
    answer_format VARCHAR(255),
    correct_answer TEXT,
    distractors JSON,
    topic_id INTEGER,
    difficulty_id INTEGER,
    explanation TEXT,
    date_created TIMESTAMP,
    last_modified TIMESTAMP,
    is_llm_generated BOOLEAN,
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id),
    FOREIGN KEY (difficulty_id) REFERENCES Difficulty_Levels(difficulty_id)
);

CREATE TABLE Child_Performance (
    up_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    child_id INTEGER,
    topic_id INTEGER,
    accuracy_score DECIMAL(5,2),
    estimated_proficiency FLOAT,
    questions_attempted INTEGER,
    average_time_spent DECIMAL(5,2),
    difficulty_id INTEGER,
    current_mastery VARCHAR(255),
    date_recorded DATE,
    FOREIGN KEY (child_id) REFERENCES Children(child_id) ON DELETE CASCADE, -- if child is deleted, delete all their performance records
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id),
    UNIQUE (child_id, topic_id) 
);

CREATE TABLE Attempted_Sets (
    set_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    child_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,
    total_questions INTEGER NOT NULL, 
    correct_answers INTEGER NOT NULL DEFAULT 0, 
    score DECIMAL(5,2) DEFAULT 0.00, 
    attempt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_spent INTEGER, -- in seconds
    FOREIGN KEY (child_id) REFERENCES Children(child_id) ON DELETE CASCADE, -- if child is deleted, delete all their attempted sets
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id)
);

CREATE TABLE Attempted_Questions (
    aq_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    child_id INTEGER,
    set_id INTEGER,
    question_id INTEGER,
    child_answer VARCHAR(255),
    is_correct BOOLEAN,
    attempt_timestamp TIMESTAMP,
    time_spent INTEGER, -- TODO: We shld consider removing this since it makes more sense for a set to have this variable instead
    FOREIGN KEY (child_id) REFERENCES Children(child_id) ON DELETE CASCADE, -- if child is deleted, delete all their attempted questions
    FOREIGN KEY (question_id) REFERENCES Questions(question_id),
    FOREIGN KEY (set_id) REFERENCES Attempted_Sets(set_id) ON DELETE CASCADE -- if set is deleted, delete all its attempted questions
);

-- Trigger to update Child_Performance after inserting into Attempted_Questions
DELIMITER $$

CREATE TRIGGER after_insert_attempted_questions
AFTER INSERT ON Attempted_Questions
FOR EACH ROW
BEGIN
    DECLARE current_correct_answers INT;
    DECLARE current_questions_attempted INT;
    DECLARE current_time_spent INT;
    DECLARE new_accuracy_score FLOAT;

    -- Check if a record already exists in Child_Performance for the same child_id, topic_id, and difficulty_level
    IF EXISTS (
        SELECT 1
        FROM Child_Performance
        WHERE child_id = NEW.child_id
          AND topic_id = (SELECT topic_id FROM Questions WHERE question_id = NEW.question_id)
          AND difficulty_id = (SELECT difficulty_id FROM Questions WHERE question_id = NEW.question_id)
    ) THEN
        -- Incrementally update the metrics
        UPDATE Child_Performance
        SET 
            questions_attempted = questions_attempted + 1,
            average_time_spent = ROUND((average_time_spent * questions_attempted + NEW.time_spent) / (questions_attempted + 1), 2),
            accuracy_score = ROUND(
                (accuracy_score * questions_attempted + IF(NEW.is_correct, 100, 0)) / (questions_attempted + 1),
                2
            )
        WHERE child_id = NEW.child_id
          AND topic_id = (SELECT topic_id FROM Questions WHERE question_id = NEW.question_id)
          AND difficulty_id = (SELECT difficulty_id FROM Questions WHERE question_id = NEW.question_id);
    ELSE
        -- Insert a new record if it doesn't exist
        INSERT INTO Child_Performance (
            child_id, 
            topic_id, 
            accuracy_score, 
            estimated_proficiency, 
            questions_attempted, 
            average_time_spent, 
            difficulty_id, 
            current_mastery, 
            date_recorded
        )
        VALUES (
            NEW.child_id,
            (SELECT topic_id FROM Questions WHERE question_id = NEW.question_id),
            ROUND(IF(NEW.is_correct, 100, 0), 2), -- Initial accuracy score rounded to 2 decimal places
            NULL, -- estimated_proficiency can be calculated separately if needed
            1, -- First question attempted
            ROUND(NEW.time_spent, 2), -- Initial time spent
            (SELECT difficulty_id FROM Questions WHERE question_id = NEW.question_id),
            NULL, -- current_mastery can be calculated separately if needed
            CURDATE()
        );
    END IF;
END$$

DELIMITER ;

-- Seed Tables for testing, you can comment out if not needed
-- Its here because I need this to run after init, but docker-compose runs both at the same time, and Im lazy to write a script to run them in order
-- TODO: Refactor this elsewhere

-- Seed Roles table
INSERT INTO Roles (role_id, role_name) VALUES 
(1, 'admin'),
(2, 'parent'), 
(3, 'other');

-- Seed Users table
INSERT INTO Users (username, email, password_hash, role_id, date_created) VALUES 
('parent1', 'parent1@example.com', '$2b$10$Q0Rzdg9l12CLWo/sxX22UOek3LDq.fqoMsnY0UC.9UVQBMupNkNRa', 1, NOW()),
('parent2', 'parent2@example.com', '$2b$10$Q0Rzdg9l12CLWo/sxX22UOek3LDq.fqoMsnY0UC.9UVQBMupNkNRa', 1, NOW()),
('parent3', 'parent3@example.com', '$2b$10$Q0Rzdg9l12CLWo/sxX22UOek3LDq.fqoMsnY0UC.9UVQBMupNkNRa', 1, NOW());

-- Seed Children table
INSERT INTO Children (user_id, child_name, age, education_level, date_created) VALUES 
(1, 'John', 10, 1, NOW()),
(1, 'Jane', 8, 1, NOW()),
(2, 'Alice', 9, 1, NOW()),
(2, 'Bob', 7, 1, NOW()),
(3, 'Charlie', 11, 1, NOW()),
(3, 'Daisy', 6, 1, NOW());

-- Seed Topics table
INSERT INTO Topics (topic_id, topic_name, topic_description) VALUES 
(1, 'Use a Rule to Make a Word', 'Learn how to use rules to form words.'),
(2, 'Complete a Word Pair', 'Complete pairs of words that go together.'),
(3, 'Anagram in a Sentence', 'Find anagrams within sentences.'),
(4, 'Word Ladders', 'Solve word ladders by changing one letter at a time.');


INSERT INTO Difficulty_Levels (difficulty_id, label, numeric_level) VALUES
(1, 'Easy', 1),
(2, 'Medium', 2),
(3, 'Hard', 3);


-- Seed Questions table
INSERT INTO Questions (question_text, answer_format, correct_answer, distractors, topic_id, difficulty_id, explanation, date_created, last_modified, is_llm_generated) VALUES
('What is 2 + 2?', 'text', '4', '["3", "5", "6"]', 1, 1,"explanation", NOW(), NOW(), FALSE),
('Complete the pair: Salt and ?', 'text', 'Pepper', '["Sugar", "Spice", "Honey"]', 2, 1, "explanation 1", NOW(), NOW(), FALSE),
('Find the anagram in the sentence: "Listen to the silent music."', 'text', 'silent', '["listen", "music", "to"]', 3, 2, "explanation 2", NOW(), NOW(), FALSE),
('Solve the word ladder: CASE ____ LASH', 'text', 'CASH', '["CAST", "LACK", "LASS", "LUSH"]', 4, 1, "explanation 3", NOW(), NOW(), FALSE),
('Solve the word ladder: COLD ____ CARD', 'text', 'CORD', '["CURD", "COED", "CALD", "COLT"]', 4, 1, "explanation 4", NOW(), NOW(), FALSE),
('Solve the word ladder: HAND ____ BEND', 'text', 'BAND', '["HARD", "BARK", "BOND", "BARE"]', 4, 1, "explanation 5", NOW(), NOW(), FALSE),
('Solve the word ladder: MIND ____ BOND', 'text', 'BIND', '["MEND", "BAND", "BIRD", "MINO"]', 4, 1, "explanation 6", NOW(), NOW(), FALSE),
('Solve the word ladder: WORE ____ WARM', 'text', 'WARE', '["WOLE", "WIDE", "WAVE", "WARD"]', 4, 1, "explanation 7", NOW(), NOW(), FALSE),
('Solve the word ladder: SAND ____ BEND', 'text', 'SEND', '["SIND", "SENT", "BIND", "SENG"]', 4, 1, "explanation 8", NOW(), NOW(), FALSE),
('Solve the word ladder: LION ____ LOAN', 'text', 'LOON', '["LIAN", "LIND", "LOOP", "LILT"]', 4, 1, "explanation 9", NOW(), NOW(), FALSE),
('Solve the word ladder: WILL ____ WIND', 'text', 'WILD', '["WILT", "WALL", "WAIL", "WIRL"]', 4, 1, "explanation 10", NOW(), NOW(), FALSE),
('Solve the word ladder: CLIP ____ SLAP', 'text', 'SLIP', '["CLIM", "SLIM", "SHIP", "FLIP"]', 4, 1, "explanation 11", NOW(), NOW(), FALSE),
('Solve the word ladder: HARD ____ BIRD', 'text', 'BARD', '["HARE", "HIRD", "HARN", "BIND"]', 4, 1, "explanation 12", NOW(), NOW(), FALSE);

-- Seed Pending_Questions table
INSERT INTO Pending_Questions (question_text, answer_format, correct_answer, distractors, topic_id, difficulty_id, explanation, date_created, last_modified, is_llm_generated) VALUES
('What is 2 + 2?', 'text', '4', '["3", "5", "6"]', 1, 1,"explanation", NOW(), NOW(), FALSE),
('Complete the pair: Salt and ?', 'text', 'Pepper', '["Sugar", "Spice", "Honey"]', 2, 1, "explanation 1", NOW(), NOW(), FALSE),
('Find the anagram in the sentence: "Listen to the silent music."', 'text', 'silent', '["listen", "music", "to"]', 3, 2, "explanation 2", NOW(), NOW(), FALSE),
('Solve the word ladder: CAT -> COT -> ?', 'text', 'COT', '["DOG", "BAT", "RAT"]', 4, 3, "explanation 3", NOW(), NOW(), FALSE);


-- -- Seed Child_Performance table
-- INSERT INTO Child_Performance (child_id, topic_id, accuracy_score, estimated_proficiency, questions_attempted, time_spent, difficulty_level, current_mastery, date_recorded) VALUES 
-- (1, 1, 85.5, 90.0, 10, 120, 1, 'Intermediate', '2025-02-22'),
-- (2, 2, 78.0, 85.0, 8, 100, 2, 'Beginner', '2025-02-22'),
-- (3, 3, 92.0, 95.0, 12, 140, 3, 'Advanced', '2025-02-22');

-- Seed Attempted_Sets table
INSERT INTO Attempted_Sets (child_id, topic_id, total_questions, correct_answers, score, time_spent) VALUES 
(1, 1, 10, 8, 80.00, 600),
(2, 2, 15, 12, 80.00, 900),
(3, 3, 20, 18, 90.00, 1200),
(4, 4, 25, 20, 80.00, 1500),
(5, 1, 10, 7, 70.00, 600),
(6, 2, 15, 10, 66.67, 900);

-- Seed Attempted_Questions table
INSERT INTO Attempted_Questions (child_id, set_id, question_id, child_answer, is_correct, attempt_timestamp, time_spent) VALUES 
(1, 1, 1, '4', TRUE, NOW(), 30),
(1, 1, 2, 'Pepper', TRUE, NOW(), 40),
(1, 1, 3, 'music', FALSE, NOW(), 50),
(1, 1, 4, 'COT', TRUE, NOW(), 60),
(1, 1, 1, '4', TRUE, NOW(), 70),
(1, 1, 2, 'Pepper', TRUE, NOW(), 80),
(1, 1, 3, 'music', FALSE, NOW(), 90),
(1, 1, 4, 'COT', TRUE, NOW(), 100),
(1, 1, 1, '4', TRUE, NOW(), 110),
(1, 1, 2, 'Pepper', TRUE, NOW(), 120),

(2, 2, 1, '4', TRUE, NOW(), 30),
(2, 2, 2, 'Pepper', TRUE, NOW(), 40),
(2, 2, 3, 'music', FALSE, NOW(), 50),
(2, 2, 4, 'COT', TRUE, NOW(), 60),
(2, 2, 1, '4', TRUE, NOW(), 70),
(2, 2, 2, 'Pepper', TRUE, NOW(), 80),
(2, 2, 3, 'music', FALSE, NOW(), 90),
(2, 2, 4, 'COT', TRUE, NOW(), 100),
(2, 2, 1, '4', TRUE, NOW(), 110),
(2, 2, 2, 'Pepper', TRUE, NOW(), 120),

(3, 3, 1, '4', TRUE, NOW(), 30),
(3, 3, 2, 'Pepper', TRUE, NOW(), 40),
(3, 3, 3, 'music', FALSE, NOW(), 50),
(3, 3, 4, 'COT', TRUE, NOW(), 60),
(3, 3, 1, '4', TRUE, NOW(), 70),
(3, 3, 2, 'Pepper', TRUE, NOW(), 80),
(3, 3, 3, 'music', FALSE, NOW(), 90),
(3, 3, 4, 'COT', TRUE, NOW(), 100),
(3, 3, 1, '4', TRUE, NOW(), 110),
(3, 3, 2, 'Pepper', TRUE, NOW(), 120);