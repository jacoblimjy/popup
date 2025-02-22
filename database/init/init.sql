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
    -- TODO: Add Education Level later
    -- level VARCHAR(255),
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
    FOREIGN KEY (topic_id) REFERENCES Topics(topic_id)
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