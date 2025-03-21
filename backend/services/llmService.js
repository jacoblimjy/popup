const axios = require("axios");
const db = require("../db");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const pendingQuestionService = require("./pendingQuestionService");
const { WordNet } = require("natural");

const TOPIC_MAPPINGS = {
  1: "rule", // Use a Rule to Make a Word
  2: "word_pair", // Complete a Word Pair
  3: "anagram", // Anagram in a Sentence
  4: "word_ladders", // Word Ladders
};

const DIFFICULTY_MAPPINGS = {
  1: "easy",
  2: "medium",
  3: "hard",
};

/**
 * Main function to generate questions
 * This function will use either the OpenAI API or mock data based on the OPENAI_API_KEY environment variable
 *
 * @param {number} topic_id - The database ID of the topic
 * @param {number} difficulty_id - The database ID of the difficulty level
 * @param {number} num_questions - Number of questions to generate
 * @returns {object} - Results of the operation
 */
async function generateQuestions(topic_id, difficulty_id, num_questions) {
  try {
    // 1. Validate input parameters
    if (!topic_id || !difficulty_id || !num_questions) {
      throw new Error(
        "Missing required parameters: topic_id, difficulty_id, or num_questions"
      );
    }

    // Cap number of questions
    const questionCount = Math.min(Math.max(1, parseInt(num_questions)), 20);

    // 2. Get topic and difficulty information from database
    const topicInfo = await getTopicInfo(topic_id);
    const difficultyInfo = await getDifficultyInfo(difficulty_id);

    console.log(
      `Generating ${questionCount} ${difficultyInfo.label} questions for topic: ${topicInfo.topic_name}`
    );

    // 3. Get the topic and difficulty keys for the YAML prompt
    const topicKey = TOPIC_MAPPINGS[topic_id];
    const difficultyKey = DIFFICULTY_MAPPINGS[difficulty_id];

    if (!topicKey) {
      throw new Error(
        `No prompt mapping found for topic_id: ${topic_id}. Please add it to TOPIC_MAPPINGS.`
      );
    }

    if (!difficultyKey) {
      throw new Error(
        `No prompt mapping found for difficulty_id: ${difficulty_id}. Please add it to DIFFICULTY_MAPPINGS.`
      );
    }

    console.log(
      `Using prompt template: topic=${topicKey}, difficulty=${difficultyKey}`
    );

    // 4. Get the appropriate prompt template
    const prompt = await getPromptFromYaml(topicKey, difficultyKey);

    // 5. Generate questions (either with API or mock data)
    let rawQuestions;

    // Check if we have an API key for OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey.length > 0) {
      console.log("Using OpenAI API for question generation");
      rawQuestions = await generateQuestionsWithOpenAI(prompt, questionCount);
    } else {
      console.log("Using mock data for question generation");
      rawQuestions = await generateQuestionsMock(topicKey, questionCount);
    }

    // 6. Validate and process questions
    const processedQuestions = await processAndValidateQuestions(
      rawQuestions,
      topic_id,
      difficulty_id
    );

    if (processedQuestions.length === 0) {
      throw new Error("No valid questions could be generated");
    }

    // 7. Save to pending questions collection
    const result = await pendingQuestionService.createPendingQuestionsBulk(
      processedQuestions
    );

    return {
      successful: result.successful,
      failed: result.failed,
      totalRequested: questionCount,
      totalProcessed: result.totalProcessed,
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

/**
 * Function to generate questions using the OpenAI API
 * Requires a valid API key to be set in the OPENAI_API_KEY environment variable
 *
 * @param {string} prompt - The prompt to send to the API
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Array} - Array of generated question objects
 */
async function generateQuestionsWithOpenAI(prompt, numQuestions) {
  try {
    console.log("Calling OpenAI API...");

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4", // Use the appropriate model (gpt-4, gpt-3.5-turbo, etc.)
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates educational questions.",
          },
          {
            role: "user",
            content:
              prompt +
              `\n\nGenerate exactly ${numQuestions} questions in JSON format.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0]?.message?.content || "{}";
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.questions || [];
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Invalid JSON response from OpenAI API");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      `Failed to call OpenAI API: ${
        error.response?.data?.error?.message || error.message
      }`
    );
  }
}

/**
 * Function to generate mock questions for testing
 * Used when OPENAI_API_KEY is not set
 *
 * @param {string} topicKey - The topic key from the mapping
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Array} - Array of mock question objects
 */
async function generateQuestionsMock(topicKey, numQuestions) {
  console.log(`Using mock data for question generation (topic: ${topicKey})`);

  // Sample questions for different topics
  const mockQuestions = {
    rule: [
      {
        question_text:
          "The words in the second set follow the same pattern as the first set. What word completes the second set? cat (cot) dog       pen (?) rat",
        answer_format: "multiple_choice",
        correct_answer: "pot",
        explanation:
          "Take the first letter of the first word and the last two letters of the second word. c + ot = cot, and p + ot = pot",
        distractors: ["pat", "per", "pog", "pan"],
      },
      {
        question_text:
          "The words in the second set follow the same pattern as the first set. What word completes the second set? fox (fit) ten       bed (?) sun",
        answer_format: "multiple_choice",
        correct_answer: "bin",
        explanation:
          "Take the first letter of the first word and the last two letters of the second word. f + it = fit, and b + in = bin",
        distractors: ["but", "bat", "bot", "bus"],
      },
      {
        question_text:
          "The words in the second set follow the same pattern as the first set. What word completes the second set? red (rim) man       top (?) sit",
        answer_format: "multiple_choice",
        correct_answer: "tit",
        explanation:
          "Take the first letter of the first word and the last two letters of the second word. r + im = rim, and t + it = tit",
        distractors: ["tip", "tap", "tom", "ten"],
      },
    ],
    word_pair: [
      {
        question_text: "Complete the pair: Hot is to Cold as Happy is to _____",
        answer_format: "multiple_choice",
        correct_answer: "Sad",
        explanation:
          "Hot and Cold are opposites, so Happy and Sad are also opposites",
        distractors: ["Warm", "Joy", "Excited", "Smile"],
      },
      {
        question_text: "Complete the pair: Car is to Road as Train is to _____",
        answer_format: "multiple_choice",
        correct_answer: "Track",
        explanation: "Cars travel on roads, and trains travel on tracks",
        distractors: ["Station", "Conductor", "Engine", "Wheel"],
      },
    ],
    anagram: [
      {
        question_text:
          "Find the anagram in this sentence: The teacher told students to remain silent during the test.",
        answer_format: "multiple_choice",
        correct_answer: "silent",
        explanation:
          "'silent' and 'listen' are anagrams - they contain the exact same letters but in a different order",
        distractors: ["teacher", "students", "remain", "during"],
      },
      {
        question_text:
          "Find the anagram in this sentence: Please listen to the story about the dusty items in the study.",
        answer_format: "multiple_choice",
        correct_answer: "listen",
        explanation:
          "'listen' and 'silent' are anagrams - they contain the exact same letters but in a different order",
        distractors: ["please", "story", "dusty", "items"],
      },
    ],
    word_ladders: [
      {
        question_text:
          "Complete this word ladder from COLD to WARM: COLD → CORD → CARD → _____ → WARM",
        answer_format: "multiple_choice",
        correct_answer: "WARD",
        explanation:
          "In a word ladder, you change one letter at a time to make a new word. CARD → WARD (change C to W)",
        distractors: ["WARP", "WART", "WORD", "WORM"],
      },
      {
        question_text:
          "Complete this word ladder from PLAY to WORK: PLAY → CLAY → _____ → CORK → WORK",
        answer_format: "multiple_choice",
        correct_answer: "CLARK",
        explanation:
          "In a word ladder, you change one letter at a time to make a new word. CLAY → CLARK (change Y to R and add K)",
        distractors: ["CLAP", "CLAW", "CLAM", "CRAY"],
      },
    ],
  };

  // Select the appropriate questions based on topic key
  const availableQuestions = mockQuestions[topicKey];

  // If no mock questions are available for this topic, throw an error
  if (!availableQuestions || availableQuestions.length === 0) {
    throw new Error(
      `No mock questions available for topic: ${topicKey}. Please add mock questions for this topic.`
    );
  }

  // Return requested number of questions (repeating if necessary)
  const result = [];
  for (let i = 0; i < numQuestions; i++) {
    result.push(availableQuestions[i % availableQuestions.length]);
  }

  return result;
}

/**
 * Get prompt from YAML file based on topic and difficulty
 * @param {string} topicKey - Topic key (e.g., "rule", "word_pair")
 * @param {string} difficultyKey - Difficulty key (e.g., "easy", "medium")
 * @returns {string} - Complete prompt text
 * @throws {Error} - If prompt is not found in YAML file
 */
async function getPromptFromYaml(topicKey, difficultyKey) {
  try {
    // Load prompts from YAML file
    const promptsFilePath = path.join(
      __dirname,
      "..",
      "llm_prompts",
      "prompts.yaml"
    );

    // Try to read and parse the YAML file
    let promptsData;
    try {
      const fileContents = fs.readFileSync(promptsFilePath, "utf8");
      promptsData = yaml.load(fileContents);
    } catch (error) {
      if (error.code === "ENOENT") {
        throw new Error(
          `prompts.yaml file not found at path: ${promptsFilePath}`
        );
      } else {
        throw new Error(`Error loading prompts.yaml: ${error.message}`);
      }
    }

    // Validate the YAML structure
    if (!promptsData || !Array.isArray(promptsData.prompts)) {
      throw new Error("Invalid prompts.yaml format: 'prompts' array not found");
    }

    // Find matching prompt template
    const promptTemplate = promptsData.prompts.find(
      (p) => p.topic === topicKey && p.difficulty === difficultyKey
    );

    // Throw error if no matching prompt is found
    if (!promptTemplate) {
      throw new Error(
        `No prompt template found in prompts.yaml for topic="${topicKey}" and difficulty="${difficultyKey}". ` +
          `Please add this combination to the prompts.yaml file.`
      );
    }

    // Validate the prompt template has all required sections
    if (!promptTemplate.system_message) {
      throw new Error(
        `Prompt template for ${topicKey}/${difficultyKey} is missing 'system_message'`
      );
    }
    if (!promptTemplate.few_shot_examples) {
      throw new Error(
        `Prompt template for ${topicKey}/${difficultyKey} is missing 'few_shot_examples'`
      );
    }
    if (!promptTemplate.assignment) {
      throw new Error(
        `Prompt template for ${topicKey}/${difficultyKey} is missing 'assignment'`
      );
    }

    // Combine the prompt components
    return `${promptTemplate.system_message}

${promptTemplate.few_shot_examples}

${promptTemplate.assignment}`;
  } catch (error) {
    console.error("Error loading prompt from YAML:", error);
    throw error; // Re-throw to be handled by the caller
  }
}

/**
 * Process and validate questions returned from the LLM
 */
async function processAndValidateQuestions(questions, topic_id, difficulty_id) {
  const validQuestions = [];
  const wordnet = new WordNet();

  // Helper function to check if a word exists using WordNet
  const wordExists = async (word) => {
    return new Promise((resolve) => {
      wordnet.lookup(word.toLowerCase().trim(), (results) => {
        resolve(results.length > 0);
      });
    });
  };

  // Validate each question
  for (const question of questions) {
    try {
      // 1. Basic structure validation
      if (!question.question_text || !question.correct_answer) {
        console.warn("Skipping question - missing required fields");
        continue;
      }

      // 2. Ensure distractors are present and in array format
      const distractors = Array.isArray(question.distractors)
        ? question.distractors
        : question.distractors
        ? [question.distractors]
        : [];

      if (distractors.length < 2) {
        console.warn("Skipping question - insufficient distractors");
        continue;
      }

      // 3. Validate the correct answer is a real word/phrase
      const words = question.correct_answer.split(/\s+/);
      let allWordsValid = true;

      for (const word of words) {
        // Skip very short words, punctuation, numbers, etc.
        if (word.length <= 1 || !isNaN(word) || /[^\w]/.test(word)) continue;

        const isValid = await wordExists(word);
        if (!isValid) {
          console.warn(`Skipping question - invalid word detected: "${word}"`);
          allWordsValid = false;
          break;
        }
      }

      if (!allWordsValid) continue;

      // 4. Format the question for database insertion
      validQuestions.push({
        question_text: question.question_text,
        answer_format: question.answer_format || "multiple_choice",
        correct_answer: question.correct_answer,
        distractors: distractors,
        topic_id: topic_id,
        difficulty_id: difficulty_id,
        explanation: question.explanation || "No explanation provided",
        is_llm_generated: true,
      });
    } catch (error) {
      console.error("Error validating question:", error);
      // Skip this question but continue processing others
    }
  }

  return validQuestions;
}

async function getTopicInfo(topic_id) {
  const [rows] = await db.execute("SELECT * FROM Topics WHERE topic_id = ?", [
    topic_id,
  ]);

  if (rows.length === 0) {
    throw new Error(`Topic with ID ${topic_id} not found in database`);
  }

  return rows[0];
}

async function getDifficultyInfo(difficulty_id) {
  const [rows] = await db.execute(
    "SELECT * FROM Difficulty_Levels WHERE difficulty_id = ?",
    [difficulty_id]
  );

  if (rows.length === 0) {
    throw new Error(
      `Difficulty level with ID ${difficulty_id} not found in database`
    );
  }

  return rows[0];
}

async function getTopicByName(topicName) {
  const [rows] = await db.execute("SELECT * FROM Topics WHERE topic_name = ?", [
    topicName,
  ]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

async function getDifficultyByLabel(difficultyLabel) {
  const [rows] = await db.execute(
    "SELECT * FROM Difficulty_Levels WHERE label = ?",
    [difficultyLabel]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

module.exports = {
  generateQuestions,
  generateQuestionsWithOpenAI,
  generateQuestionsMock,
  getTopicByName,
  getDifficultyByLabel,
};
