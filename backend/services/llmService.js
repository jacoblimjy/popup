// services/llmService.js
const axios = require("axios");
const db = require("../db");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const pendingQuestionService = require("./pendingQuestionService");
const { WordNet } = require("natural");

/**
 * Generates and saves questions using LLM based on topic, difficulty and count
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

    // 3. Get the appropriate prompt template
    const prompt = await buildPrompt(
      topicInfo.topic_name,
      difficultyInfo.label
    );

    // 4. Call LLM API to generate questions
    const rawQuestions = await callLLMApi(prompt, questionCount);

    // 5. Validate and process questions
    const processedQuestions = await processAndValidateQuestions(
      rawQuestions,
      topic_id,
      difficulty_id
    );

    if (processedQuestions.length === 0) {
      throw new Error("No valid questions could be generated");
    }

    // 6. Save to pending questions collection
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
 * Build a prompt for the LLM based on topic and difficulty
 */
async function buildPrompt(topicName, difficultyLabel) {
  try {
    // Convert to expected format for prompt lookup
    const topic = topicName.toLowerCase().replace(/\s+/g, "_");
    const difficulty = difficultyLabel.toLowerCase();

    // Load prompts from YAML file
    const promptsFilePath = path.join(
      __dirname,
      "..",
      "llm_prompts",
      "prompts.yaml"
    );
    const promptsData = yaml.load(fs.readFileSync(promptsFilePath, "utf8"));

    if (!promptsData || !Array.isArray(promptsData.prompts)) {
      throw new Error("Invalid prompts data format");
    }

    // Find matching prompt template
    const promptTemplate = promptsData.prompts.find(
      (p) => p.topic === topic && p.difficulty === difficulty
    );

    if (!promptTemplate) {
      // Fallback to a general template if specific one not found
      console.warn(
        `No specific prompt found for ${topic}/${difficulty}, using general template`
      );
      return createGeneralPrompt(topicName, difficultyLabel);
    }

    // Combine the prompt components
    return `${promptTemplate.system_message}

${promptTemplate.few_shot_examples}

${promptTemplate.assignment}`;
  } catch (error) {
    console.error("Error building prompt:", error);
    throw new Error(`Failed to build prompt: ${error.message}`);
  }
}

/**
 * Creates a general-purpose prompt when a specific one is not available
 */
function createGeneralPrompt(topicName, difficultyLabel) {
  return `
You are an educational question generator specializing in ${topicName} questions.

Create ${difficultyLabel} difficulty questions with the following structure:
1. Clear question text
2. One correct answer
3. 3-4 plausible distractor options that are clearly incorrect
4. A brief explanation of why the correct answer is correct

Format your response as a JSON array of question objects with these properties:
- question_text: The question being asked
- answer_format: "multiple_choice"
- correct_answer: The correct answer
- distractors: An array of incorrect answers
- explanation: Why the correct answer is correct

Use age-appropriate language and concepts suitable for ${difficultyLabel} difficulty.
  `;
}

/**
 * Call the LLM API to generate questions
 */
async function callLLMApi(prompt, numQuestions) {
  try {
    // For production use with OpenAI:
    if (process.env.OPENAI_API_KEY) {
      console.log("Calling OpenAI API...");

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
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
        console.error("Error parsing LLM response:", parseError);
        throw new Error("Invalid JSON response from LLM");
      }
    }

    // Mock response for development/testing
    console.log("Using mock LLM response (no API key configured)");
    return [
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
    ];
  } catch (error) {
    console.error("LLM API error:", error);
    throw new Error(
      `Failed to call LLM API: ${
        error.response?.data?.error?.message || error.message
      }`
    );
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

/**
 * Get topic information by ID
 */
async function getTopicInfo(topic_id) {
  const [rows] = await db.execute("SELECT * FROM Topics WHERE topic_id = ?", [
    topic_id,
  ]);

  if (rows.length === 0) {
    throw new Error(`Topic with ID ${topic_id} not found`);
  }

  return rows[0];
}

/**
 * Get difficulty level information by ID
 */
async function getDifficultyInfo(difficulty_id) {
  const [rows] = await db.execute(
    "SELECT * FROM Difficulty_Levels WHERE difficulty_id = ?",
    [difficulty_id]
  );

  if (rows.length === 0) {
    throw new Error(`Difficulty level with ID ${difficulty_id} not found`);
  }

  return rows[0];
}

/**
 * Get topic by name
 */
async function getTopicByName(topicName) {
  const [rows] = await db.execute("SELECT * FROM Topics WHERE topic_name = ?", [
    topicName,
  ]);

  if (rows.length === 0) {
    return null;
  }

  return rows[0];
}

/**
 * Get difficulty level by label
 */
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
  getTopicByName,
  getDifficultyByLabel,
};
