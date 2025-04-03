require("dotenv").config();

const getLLMConfig = () => {
  return {
    model: process.env.LLM_MODEL || "gpt-4o",
    temperature: parseFloat(process.env.LLM_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || "3000"),
    topP: parseFloat(process.env.LLM_TOP_P || "1"),
    frequencyPenalty: parseFloat(process.env.LLM_FREQUENCY_PENALTY || "0"),
    presencePenalty: parseFloat(process.env.LLM_PRESENCE_PENALTY || "0"),
  };
};

const getQuestionGenConfig = () => {
  return {
    similarityThreshold: parseFloat(
      process.env.QUESTION_SIMILARITY_THRESHOLD || "0.7"
    ),
    maxQuestionsPerBatch: parseInt(process.env.MAX_QUESTIONS_PER_BATCH || "20"),
  };
};

const hasOpenAIAPIKey = () => {
  return !!(
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0
  );
};

module.exports = {
  getLLMConfig,
  getQuestionGenConfig,
  hasOpenAIAPIKey,
};
