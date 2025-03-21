const { WordNet } = require("natural");

const validateJSONResponse = (response) => {
  try {
    const parsed = JSON.parse(response);
    if (!Array.isArray(parsed)) {
      throw new Error("Response is not a valid JSON array");
    }
    return parsed;
  } catch (error) {
    console.error("Invalid JSON response:", error.message);
    throw new Error("LLM response is not valid JSON");
  }
};

const validateQuestionStructure = (question) => {
  const requiredFields = ["question_text", "correct_answer", "distractors", "explanation"];
  for (const field of requiredFields) {
    if (!question[field]) {
      console.error(`Missing field: ${field}`);
      return false;
    }
  }

  if (!Array.isArray(question.distractors) || question.distractors.length === 0) {
    console.error("Invalid distractors:", question.distractors);
    return false;
  }

  return true;
};

const validateRealWords = async (text) => {
    const wordnet = new WordNet();
    const words = text.split(/\s+/);
  
    for (const word of words) {
      const isValid = await new Promise((resolve) => {
        wordnet.lookup(word, (results) => {
          resolve(results.length > 0); // If results are found, the word is valid
        });
      });
  
      if (!isValid) {
        console.error(`Invalid word detected: ${word}`);
        return false;
      }
    }
  
    return true;
  };

module.exports = {
  validateJSONResponse,
  validateQuestionStructure,
  validateRealWords,
};