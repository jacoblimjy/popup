USE vrc;

-- Seed Roles table
INSERT INTO Roles (role_id, role_name) VALUES (1, 'admin') (2, 'parent') (3, 'other');

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
INSERT INTO Difficulty_Levels (difficulty_id, difficulty_name, numeric_level) VALUES 
(1, 'Easy', 1),
(2, 'Medium', 2),
(3, 'Hard', 3);

-- Seed Child_Performance table
INSERT INTO Child_Performance (child_id, topic_id, accuracy_score, estimated_proficiency, questions_attempted, time_spent, difficulty_level, current_mastery, date_recorded) VALUES 
(1, 1, 85.5, 90.0, 10, 120, 1, 'Intermediate', '2025-02-22'),
(2, 2, 78.0, 85.0, 8, 100, 2, 'Beginner', '2025-02-22'),
(3, 3, 92.0, 95.0, 12, 140, 3, 'Advanced', '2025-02-22')
