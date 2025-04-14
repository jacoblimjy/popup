const axios = require("axios");
const db = require("../db");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const os = require("os");
const pendingQuestionService = require("./pendingQuestionService");
const { WordNet } = require("natural");
const {
  getLLMConfig,
  getQuestionGenConfig,
  hasOpenAIAPIKey,
} = require("../config/llmSettings");

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

function cleanText(text) {
  if (!text) return "";
  // Replace all \n with spaces
  return (
    text
      .replace(/\\n/g, " ")
      // Also replace actual newlines
      .replace(/\n/g, " ")
      // Remove excess spaces
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Calculate text similarity between two strings using Jaccard similarity
 * @param {string} text1
 * @param {string} text2
 * @returns {number} Similarity score between 0 and 1
 */
function calculateTextSimilarity(text1, text2) {
  // Split texts into words
  const words1 = text1.split(/\s+/).filter((word) => word.length > 2); // Filter out very short words
  const words2 = text2.split(/\s+/).filter((word) => word.length > 2);

  // Create sets of words
  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Calculate intersection
  const intersection = new Set();
  for (const word of set1) {
    if (set2.has(word)) {
      intersection.add(word);
    }
  }

  // Calculate union
  const union = new Set([...set1, ...set2]);

  // Jaccard similarity = size of intersection / size of union
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Execute a Python evaluator script with the given input data
 * @param {string} scriptName - Name of the Python script without extension
 * @param {Object} inputData - Data to pass to the script
 * @returns {Promise<Object>} - Processed result from the script
 */
async function runPythonEvaluator(scriptName, inputData) {
  try {
    // Create temporary input file
    const tempFile = path.join(os.tmpdir(), `${Date.now()}_input.json`);
    fs.writeFileSync(tempFile, JSON.stringify(inputData));

    // Path to Python script
    const scriptPath = path.join(
      __dirname,
      "..",
      "llm_prompts",
      `${scriptName}.py`
    );

    // Execute Python script with input file
    const command = `python "${scriptPath}" "${tempFile}"`;
    console.log(`Executing: ${command}`);

    const { stdout, stderr } = await execPromise(command);

    // Clean up temp file
    fs.unlinkSync(tempFile);

    // This seems to never catch the error at all, its always caught in the catch block
    if (stderr && !stderr.includes("Warning")) {
      console.error(`Python script error (${scriptName}.py):`, stderr);
      throw new Error(`Error in Python evaluator: ${stderr}`);
    }

    // Parse and return the result
    return JSON.parse(stdout);
  } catch (error) {
    // TODO: Improve error message handling
    console.error(`Failed to run Python evaluator ${scriptName}.py:`, error);
    throw error;
  }
}

/**
 * Extract anagram data from question
 * @param {Object} question - Question object
 * @returns {Object} - Data needed for anagram.py
 */
function extractAnagramData(question) {
  // Find the capitalized word in the question text
  const capitalWordMatch = question.question_text.match(/\b([A-Z]{6,})\b/);
  const capitalizedWord = capitalWordMatch ? capitalWordMatch[1] : null;

  if (!capitalizedWord) {
    throw new Error("No capitalized word found in anagram question");
  }

  return {
    question_text: question.question_text,
    correct_answer: question.correct_answer,
    explanation: question.explanation,
    answer_format: question.answer_format,
  };
}

/**
 * Extract word ladder data from question
 * @param {Object} question - Question object
 * @returns {Object} - Data for ladder_eval.py
 */
function extractWordLadderData(question) {
  // This is highly dependent on question format
  // Example implementation for "WORD ____ LAST" format:
  if (
    question.set &&
    Array.isArray(question.set) &&
    question.set.length === 3
  ) {
    return { set: question.set.map((word) => word.toUpperCase()) };
  }

  let set = [];

  const match = question.question_text.match(
    /([A-Z]{4})\s+(?:____|\?)\s+([A-Z]{4})/i
  );
  if (match) {
    set = [
      match[1].toUpperCase(),
      question.correct_answer.toUpperCase(),
      match[2].toUpperCase(),
    ];
  } else {
    // Try alternative format: "FIRST → ____ → LAST"
    const arrowMatch = question.question_text.match(
      /([A-Z]{4})\s*→\s*(?:____|\?)\s*→\s*([A-Z]{4})/i
    );
    if (arrowMatch) {
      set = [
        arrowMatch[1].toUpperCase(),
        question.correct_answer.toUpperCase(),
        arrowMatch[2].toUpperCase(),
      ];
    }
  }

  if (set.length !== 3) {
    throw new Error("Could not extract word ladder set from question");
  }

  return { set };
}

/**
 * Extract word pair data from question
 * @param {Object} question - Question object
 * @returns {Object} - Data for pair_eval.py
 */
function extractWordPairData(question) {
  const questionText = question.question_text;

  // Match all word-like tokens including "(?)"
  const tokens = questionText.match(/\b\w+\b|\(\?\)/g);
  if (!tokens) throw new Error("No tokens found in question");

  // Find index of "(?)" only
  const questionMarkIndex = tokens.findIndex((token) => token === "(?)");
  if (questionMarkIndex < 5) {
    throw new Error("Not enough words before (?) in word pair question");
  }
  // Get the 5 words before "(?)"
  const wordsBefore = tokens.slice(questionMarkIndex - 5, questionMarkIndex);

  // Append correct answer as the missing word
  const set = [...wordsBefore, question.correct_answer];

  if (set.length !== 6) {
    throw new Error(`Invalid word pair set length: ${set.length}`);
  }

  return { set };
}

/**
 * Extract rule data from question
 * @param {Object} question - Question object
 * @returns {Object} - Data for rule_eval.py
 */
function extractRuleData(question) {
  // Look for solved and unsolved sets
  // Example: "cat (cot) dog       pen (?) rat"
  const text = question.question_text;

  // Extract solved set
  const solvedMatch = text.match(/([a-z]+)\s+\(([a-z]+)\)\s+([a-z]+)/i);
  if (!solvedMatch) {
    throw new Error("Could not extract solved set from rule question");
  }
  const solvedSet = [solvedMatch[1], solvedMatch[2], solvedMatch[3]];

  // Extract unsolved set
  const unsolvedMatch = text.match(/([a-z]+)\s+\(\?\)\s+([a-z]+)/i);
  if (!unsolvedMatch) {
    throw new Error("Could not extract unsolved set from rule question");
  }

  const unsolvedSet = [
    unsolvedMatch[1],
    question.correct_answer,
    unsolvedMatch[2],
  ];

  return {
    solved_set: solvedSet,
    unsolved_set: unsolvedSet,
  };
}

/**
 * Check if a question is a duplicate of an existing question in the database
 * Primary check is based on the correct answer, with secondary checks on question text
 *
 * @param {Object} question - The question object to check
 * @param {string} question.question_text - The text of the question
 * @param {string} question.correct_answer - The correct answer to the question
 * @param {number} question.topic_id - The topic ID of the question
 * @returns {Promise<{isDuplicate: boolean, existingQuestionId: number|null, reason: string|null}>}
 */
async function checkDuplicateQuestion(question) {
  try {
    const { question_text, correct_answer, topic_id } = question;

    // Get similarity threshold from configuration
    const { similarityThreshold } = getQuestionGenConfig();

    // Convert correct answer to lowercase for case-insensitive comparison
    const normalizedAnswer = correct_answer.toLowerCase().trim();

    // First, check if there's a question with the exact same answer within the same topic
    const [exactAnswerMatches] = await db.execute(
      `SELECT 
        question_id, 
        question_text, 
        correct_answer 
      FROM 
        Questions 
      WHERE 
        LOWER(TRIM(correct_answer)) = ? 
        AND topic_id = ?`,
      [normalizedAnswer, topic_id]
    );

    if (exactAnswerMatches.length > 0) {
      return {
        isDuplicate: true,
        existingQuestionId: exactAnswerMatches[0].question_id,
        reason: `Question has same correct answer as existing question ID ${exactAnswerMatches[0].question_id}`,
      };
    }

    // Also check pending questions (questions not yet approved)
    const [pendingExactAnswerMatches] = await db.execute(
      `SELECT 
        pending_question_id, 
        question_text, 
        correct_answer 
      FROM 
        Pending_Questions 
      WHERE 
        LOWER(TRIM(correct_answer)) = ? 
        AND topic_id = ?`,
      [normalizedAnswer, topic_id]
    );

    if (pendingExactAnswerMatches.length > 0) {
      return {
        isDuplicate: true,
        existingQuestionId: pendingExactAnswerMatches[0].pending_question_id,
        reason: `Question has same correct answer as pending question ID ${pendingExactAnswerMatches[0].pending_question_id}`,
      };
    }

    // Next, check for similar question text
    // This is a secondary check that helps catch questions that are phrased differently
    // but are essentially asking the same thing

    // Normalize the question text
    const normalizedQuestionText = question_text
      .toLowerCase()
      .replace(/[^\w\s]/g, "") // Remove punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Get all questions of the same topic for comparison
    const [topicQuestions] = await db.execute(
      `SELECT 
        question_id, 
        question_text 
      FROM 
        Questions 
      WHERE 
        topic_id = ?`,
      [topic_id]
    );

    // Check similarity with existing questions
    for (const existingQuestion of topicQuestions) {
      const existingText = existingQuestion.question_text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Calculate text similarity (Jaccard similarity of words)
      const similarity = calculateTextSimilarity(
        normalizedQuestionText,
        existingText
      );

      // If similarity is above threshold, consider it a duplicate
      if (similarity > similarityThreshold) {
        return {
          isDuplicate: true,
          existingQuestionId: existingQuestion.question_id,
          reason: `Question text is ${Math.round(
            similarity * 100
          )}% similar to existing question ID ${existingQuestion.question_id}`,
        };
      }
    }

    // Also check pending questions for text similarity
    const [pendingTopicQuestions] = await db.execute(
      `SELECT 
        pending_question_id, 
        question_text 
      FROM 
        Pending_Questions 
      WHERE 
        topic_id = ?`,
      [topic_id]
    );

    for (const pendingQuestion of pendingTopicQuestions) {
      const pendingText = pendingQuestion.question_text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const similarity = calculateTextSimilarity(
        normalizedQuestionText,
        pendingText
      );

      if (similarity > similarityThreshold) {
        return {
          isDuplicate: true,
          existingQuestionId: pendingQuestion.pending_question_id,
          reason: `Question text is ${Math.round(
            similarity * 100
          )}% similar to pending question ID ${
            pendingQuestion.pending_question_id
          }`,
        };
      }
    }

    return {
      isDuplicate: false,
      existingQuestionId: null,
      reason: null,
    };
  } catch (error) {
    console.error("Error checking for duplicate questions:", error);
    return {
      isDuplicate: false,
      existingQuestionId: null,
      reason: `Error during duplicate check: ${error.message}`,
    };
  }
}

/**
 * Process and validate questions returned from the LLM
 * Enhanced with duplicate detection focusing on answer similarity
 */
async function processAndValidateQuestions(questions, topic_id, difficulty_id) {
  const validQuestions = [];
  const skippedQuestions = []; // Track skipped questions for reporting
  const wordnet = new WordNet();

  // Get the topic type based on I
  const topicType = TOPIC_MAPPINGS[topic_id];

  // Helper function to check if a word exists using WordNet
  const wordExists = async (word) => {
    return new Promise((resolve) => {
      wordnet.lookup(word.toLowerCase().trim(), (results) => {
        resolve(results.length > 0);
      });
    });
  };

  console.log(
    `Processing ${questions.length} generated questions for topic ID ${topic_id} (${topicType}), difficulty ID ${difficulty_id}`
  );

  // Validate each question
  for (const question of questions) {
    try {
      // Track validation information for this question
      const validationInfo = {
        question_text: question.question_text,
        status: "processing",
        reason: null,
      };

      // 1. Basic structure validation
      if (!question.question_text || !question.correct_answer) {
        validationInfo.status = "rejected";
        validationInfo.reason =
          "Missing required fields (question_text or correct_answer)";
        skippedQuestions.push(validationInfo);
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
        validationInfo.status = "rejected";
        validationInfo.reason = "Insufficient distractors (minimum 2 required)";
        skippedQuestions.push(validationInfo);
        console.warn("Skipping question - insufficient distractors");
        continue;
      }

      // 3. Validate the correct answer is a real word/phrase (if not a multiple-choice letter)
      if (!question.correct_answer.match(/^[A-E]$/)) {
        const words = question.correct_answer.split(/\s+/);
        let allWordsValid = true;

        for (const word of words) {
          // Skip very short words, punctuation, numbers, etc.
          if (word.length <= 1 || !isNaN(word) || /[^\w]/.test(word)) continue;

          const isValid = await wordExists(word);
          if (!isValid) {
            validationInfo.status = "rejected";
            validationInfo.reason = `Invalid word detected in answer: "${word}"`;
            allWordsValid = false;
            break;
          }
        }

        if (!allWordsValid) {
          skippedQuestions.push(validationInfo);
          console.warn(`Skipping question - invalid word detected in answer`);
          continue;
        }
      }

      // 4. Process based on question type
      let processedQuestion = { ...question };

      try {
        if (topicType === "anagram") {
          // Process anagram with Python script
          const anagramData = extractAnagramData(question);
          processedQuestion = await runPythonEvaluator("anagram", anagramData);
          console.log("Anagram question processed successfully");
        } else if (topicType === "word_ladders") {
          // Validate word ladder with Python script
          const ladderData = extractWordLadderData(question);
          await runPythonEvaluator("ladder_eval", ladderData);
          console.log("Word ladder validated successfully");
        } else if (topicType === "word_pair") {
          // Validate word pair with Python script
          const pairData = extractWordPairData(question);
          await runPythonEvaluator("pair_eval", pairData);
          console.log("Word pair validated successfully");
        } else if (topicType === "rule") {
          // Validate rule with Python script
          const ruleData = extractRuleData(question);
          await runPythonEvaluator("rule_eval", ruleData);
          console.log("Rule question validated successfully");
        }
      } catch (evalError) {
        console.error(`${topicType} evaluation failed:`, evalError);
        validationInfo.status = "rejected";
        validationInfo.reason = `${topicType} evaluation failed: ${evalError.message}`;
        skippedQuestions.push(validationInfo);
        console.warn(`Skipping question - ${topicType} evaluation failed`);
        continue;
      }

      // 5. Check for duplicate questions based on answer and question similarity
      const questionToCheck = {
        question_text: processedQuestion.question_text,
        correct_answer: processedQuestion.correct_answer,
        topic_id: topic_id,
      };

      const duplicateCheck = await checkDuplicateQuestion(questionToCheck);

      if (duplicateCheck.isDuplicate) {
        validationInfo.status = "duplicate";
        validationInfo.reason = duplicateCheck.reason;
        validationInfo.existingQuestionId = duplicateCheck.existingQuestionId;
        skippedQuestions.push(validationInfo);
        console.warn(`Skipping question - ${duplicateCheck.reason}`);
        continue;
      }

      // 6. Format the question for database insertion
      validQuestions.push({
        question_text: cleanText(processedQuestion.question_text),
        answer_format: processedQuestion.answer_format || "multiple_choice",
        correct_answer: processedQuestion.correct_answer,
        distractors: Array.isArray(processedQuestion.distractors)
          ? processedQuestion.distractors
          : [processedQuestion.distractors],
        topic_id: topic_id,
        difficulty_id: difficulty_id,
        explanation: cleanText(
          processedQuestion.explanation || "No explanation provided"
        ),
        is_llm_generated: true,
      });

      validationInfo.status = "accepted";
      console.log(
        `Question validated and accepted: "${processedQuestion.question_text.substring(
          0,
          50
        )}..."`
      );
    } catch (error) {
      console.error("Error validating question:", error);
      // Record the error but continue processing other questions
      skippedQuestions.push({
        question_text: question.question_text || "Unknown question",
        status: "error",
        reason: `Error during validation: ${error.message}`,
      });
    }
  }

  // Log validation summary
  console.log(
    `Validation complete. ${validQuestions.length} accepted, ${skippedQuestions.length} rejected.`
  );

  // Return both valid questions and information about skipped questions
  return {
    validQuestions,
    skippedQuestions,
    stats: {
      total: questions.length,
      accepted: validQuestions.length,
      rejected: skippedQuestions.length,
      duplicates: skippedQuestions.filter((q) => q.status === "duplicate")
        .length,
    },
  };
}

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

    // Get configuration for question generation
    const { maxQuestionsPerBatch } = getQuestionGenConfig();

    // Cap number of questions
    const requestedCount = Math.min(
      Math.max(1, parseInt(num_questions)),
      maxQuestionsPerBatch
    );

    // 2. Get topic and difficulty information from database
    const topicInfo = await getTopicInfo(topic_id);
    const difficultyInfo = await getDifficultyInfo(difficulty_id);

    console.log(
      `Generating ${requestedCount} ${difficultyInfo.label} questions for topic: ${topicInfo.topic_name}`
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

    // Track our results
    let validQuestions = [];
    let allSkippedQuestions = [];
    let totalGenerated = 0;
    let attempts = 0;
    const MAX_ATTEMPTS = 5; // Limit the number of attempts to prevent infinite loops

    // 5. Generate and validate questions in batches until we have enough or reach max attempts
    while (validQuestions.length < requestedCount && attempts < MAX_ATTEMPTS) {
      attempts++;

      // Calculate how many more questions we need
      const remainingCount = requestedCount - validQuestions.length;
      // Generate more than we need to account for rejections (2x as many)
      const batchSize = Math.min(remainingCount * 2, maxQuestionsPerBatch);

      console.log(
        `Attempt ${attempts}: Generating batch of ${batchSize} questions (need ${remainingCount} more)`
      );

      // Generate questions (either with API or mock data)
      let rawQuestions;
      if (hasOpenAIAPIKey()) {
        console.log("Using OpenAI API for question generation");
        rawQuestions = await generateQuestionsWithOpenAI(prompt, batchSize);
      } else {
        console.log("Using mock data for question generation");
        rawQuestions = await generateQuestionsMock(topicKey, batchSize);
      }

      totalGenerated += rawQuestions.length;

      // Validate and process questions
      const processedQuestions = await processAndValidateQuestions(
        rawQuestions,
        topic_id,
        difficulty_id
      );

      // Add valid questions to our running total
      validQuestions = validQuestions.concat(processedQuestions.validQuestions);
      allSkippedQuestions = allSkippedQuestions.concat(
        processedQuestions.skippedQuestions
      );

      console.log(
        `After attempt ${attempts}: Have ${validQuestions.length}/${requestedCount} valid questions`
      );

      // If we have enough valid questions, or we didn't get any valid questions in this batch
      if (
        validQuestions.length >= requestedCount ||
        processedQuestions.validQuestions.length === 0
      ) {
        break;
      }
    }

    // Trim to the requested count if we have more
    if (validQuestions.length > requestedCount) {
      validQuestions = validQuestions.slice(0, requestedCount);
    }

    if (validQuestions.length === 0) {
      throw new Error(
        "No valid questions could be generated after multiple attempts"
      );
    }

    // 6. Save to pending questions collection
    const result = await pendingQuestionService.createPendingQuestionsBulk(
      validQuestions
    );

    return {
      successful: result.successful,
      failed: result.failed,
      totalRequested: requestedCount,
      totalGenerated: totalGenerated,
      totalProcessed: result.totalProcessed,
      successCount: result.successCount,
      failureCount: result.failureCount,
      validationStats: {
        total: totalGenerated,
        accepted: validQuestions.length,
        rejected: allSkippedQuestions.length,
        duplicates: allSkippedQuestions.filter((q) => q.status === "duplicate")
          .length,
      },
      skippedQuestions: allSkippedQuestions,
      attempts: attempts,
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

    // Get LLM configuration
    const llmConfig = getLLMConfig();

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: llmConfig.model,
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
        // temperature: llmConfig.temperature,
        max_completion_tokens: llmConfig.maxTokens,
        top_p: llmConfig.topP,
        frequency_penalty: llmConfig.frequencyPenalty,
        presence_penalty: llmConfig.presencePenalty,
        reasoning_effort: llmConfig.reasoningEffort,
        response_format: {
          // TODO: We can refactor this schema to another file
          type: "json_schema",
          json_schema: {
            name: "questions",
            strict: true,
            schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question_text: { type: "string" },
                      answer_format: {
                        type: "string",
                        // Enum values for answer format
                        // We can edit the prompts yaml later on
                        enum: ["multiple_choice"],
                      },
                      correct_answer: { type: "string" },
                      explanation: { type: "string" },
                      distractors: {
                        type: "array",
                        items: { type: "string" },
                      },
                      // Add additional fields needed for python evaluators
                      // set: {
                      //   type: "array",
                      //   items: { type: "string" },
                      // },
                      // solved_set: {
                      //   type: "array",
                      //   items: { type: "string" },
                      // },
                      // unsolved_set: {
                      //   type: "array",
                      //   items: { type: "string" },
                      // },
                    },
                    required: [
                      "question_text",
                      "answer_format",
                      "correct_answer",
                      "explanation",
                      "distractors",
                      // "set",
                      // "solved_set",
                      // "unsolved_set",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["questions"],
              additionalProperties: false,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0]?.message?.content || "{}";

    console.log(content);

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
          "The words in the second set follow the same pattern as the first set. What word completes the second set? tap (pod) nod       son (?) rib",
        answer_format: "multiple_choice",
        correct_answer: "nib",
        explanation:
          "Take the last letter of the first word and the last two letters of the back word. p + od = pod, and n + ib = nib",
        distractors: ["sob", "bin", "rob", "sin"],
      },
      {
        question_text:
          "The words in the second set follow the same pattern as the first set. What word completes the second set? fox (fit) tit       bed (?) sun",
        answer_format: "multiple_choice",
        correct_answer: "bun",
        explanation:
          "Take the first letter of the first word and the last two letters of the back word. f + it = fit, and b + un = bun",
        distractors: ["but", "bat", "bot", "bus"],
      },
      {
        question_text:
          "The words in the second set follow the same pattern as the first set. What word completes the second set? red (ran) man       top (?) sit",
        answer_format: "multiple_choice",
        correct_answer: "tit",
        explanation:
          "Take the first letter of the first word and the last two letters of the back word. r + an = ran, and t + it = tit",
        distractors: ["tip", "tap", "tom", "ten"],
      },
    ],
    word_pair: [
      {
        question_text:
          "Find the word that completes the third pair of words so that it follows the same pattern as the first two pairs. marks arm   ready ear   glove (?) Which of the following is the missing word?",
        answer_format: "multiple_choice",
        correct_answer: "log",
        explanation:
          "The pattern is to remove the last two letters, then move the first letter to end of the word",
        distractors: ["vex", "goy", "gel", "vex"],
      },
      {
        question_text:
          "Find the word that completes the third pair of words so that it follows the same pattern as the first two pairs. extent ten  places ape  inform (?) Which of the following is the missing word?",
        answer_format: "multiple_choice",
        correct_answer: "fir",
        explanation:
          "The pattern is to take the first, third and fifth letters of the word and arrange them in the order 3rd, 1st, 5th.",
        distractors: ["for", "nor", "fin", "ion"],
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
          "Change one letter at a time to make the first word into the final word. The answer must be a real word. CASE ____ LASH",
        answer_format: "multiple_choice",
        correct_answer: "CASH",
        explanation:
          "      CASE → CASH: Change the last letter from 'E' to 'H' to form CASH CASH → LASH: Change the first letter from 'C' to 'L' to form LASH",
        distractors: ["CAST", "LUSH", "LACK", "LASS"],
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
  checkDuplicateQuestion,
  calculateTextSimilarity,
};
