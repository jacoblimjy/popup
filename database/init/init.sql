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
    age INTEGER,
    education_level INTEGER,
    date_created TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
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
    question_id INTEGER PRIMARY KEY,
    question_text TEXT,
    answer_format VARCHAR(255),
    correct_answer TEXT,
    distractors JSON,
    topic_id INTEGER,
    difficulty_id INTEGER,
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
    accuracy_score FLOAT,
    estimated_proficiency FLOAT,
    questions_attempted INTEGER,
    time_spent INTEGER,
    difficulty_level INTEGER,
    current_mastery VARCHAR(255),
    date_recorded DATE,
    FOREIGN KEY (child_id) REFERENCES Children(child_id),
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id),
    UNIQUE (child_id, topic_id) 
);

CREATE TABLE Attempted_Questions (
    aq_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    child_id INTEGER,
    question_id INTEGER,
    child_answer VARCHAR(255),
    is_correct BOOLEAN,
    attempt_timestamp TIMESTAMP,
    time_spent INTEGER,
    FOREIGN KEY (child_id) REFERENCES Children(child_id),
    FOREIGN KEY (question_id) REFERENCES Questions(question_id)
);

CREATE TABLE LLM_Calls (
    llm_call_id INTEGER PRIMARY KEY,
    prompt_text TEXT,
    response_text TEXT,
    tokens_used INTEGER,
    date_called TIMESTAMP
);


-- Seed Tables for testing, you can comment out if not needed
-- Its here because I need this to run after init, but docker-compose runs both at the same time, and Im lazy to write a script to run them in order
-- TODO: Refactor this elsewhere

-- Seed Roles table
INSERT INTO Roles (role_id, role_name) VALUES (1, 'parent');

-- Seed Users table
INSERT INTO Users (username, email, password_hash, role_id, date_created) VALUES 
('parent1', 'parent1@example.com', '$2b$10$7QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8', 1, NOW()),
('parent2', 'parent2@example.com', '$2b$10$7QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8', 1, NOW()),
('parent3', 'parent3@example.com', '$2b$10$7QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8QJ8', 1, NOW());

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

-- Seed Difficulty_Levels table
INSERT INTO Difficulty_Levels (difficulty_id, label, numeric_level) VALUES 
(1, 'Easy', 1),
(2, 'Medium', 2),
(3, 'Hard', 3);

-- Seed Child_Performance table
INSERT INTO Child_Performance (child_id, topic_id, accuracy_score, estimated_proficiency, questions_attempted, time_spent, difficulty_level, current_mastery, date_recorded) VALUES 
(1, 1, 85.5, 90.0, 10, 120, 1, 'Intermediate', '2025-02-22'),
(2, 2, 78.0, 85.0, 8, 100, 2, 'Beginner', '2025-02-22'),
(3, 3, 92.0, 95.0, 12, 140, 3, 'Advanced', '2025-02-22')
