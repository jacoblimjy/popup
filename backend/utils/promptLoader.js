const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function loadPrompts() {
  try {
    const filePath = path.join(__dirname, "prompts.yaml");
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents);
  } catch (error) {
    console.error("Error loading YAML prompts:", error);
    throw error;
  }
}

function getPromptByTopicAndDifficulty(topic, difficulty) {
  const data = loadPrompts();
  if (!data || !Array.isArray(data.prompts)) {
    throw new Error(
      'prompts.yaml structure invalid — missing "prompts" array.'
    );
  }

  const found = data.prompts.find(
    (item) => item.topic === topic && item.difficulty === difficulty
  );

  if (!found) {
    throw new Error(
      `No prompt found for topic="${topic}" & difficulty="${difficulty}". Check prompts.yaml.`
    );
  }

  return {
    system_message: found.system_message,
    few_shot_examples: found.few_shot_examples,
    assignment: found.assignment,
  };
}

module.exports = {
  loadPrompts,
  getPromptByTopicAndDifficulty,
};
