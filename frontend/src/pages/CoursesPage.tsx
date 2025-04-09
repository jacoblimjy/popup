import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildrenList } from "../hooks/useChildrenList";
import { difficulty_levels, topics } from "../utils";
import NoChildModal from "../components/NoChildModal";

const CoursesPage = () => {
  const navigate = useNavigate();
  const { childrenList } = useChildrenList();

  const [chosenTopic, setChosenTopic] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [isNoChildModalOpen, setIsNoChildModalOpen] = useState(false);

  const handleStartPractice = () => {
    if (!childrenList || childrenList.length === 0) {
      setIsNoChildModalOpen(true);
      return;
    }

    if (chosenTopic && difficulty) {
      navigate(`/practice/${chosenTopic}/${difficulty}/`);
    }
  };

  const handleSelectTopic = (topic: string) => {
    if (chosenTopic === topic) {
      setChosenTopic(null);
      return;
    }
    setChosenTopic(topic);
  };

  const handleSelectDifficulty = (level: string) => {
    if (difficulty === level) {
      setDifficulty(null);
      return;
    }
    setDifficulty(level);
  }

  return (
    <div className="flex flex-col items-center md:justify-center p-6 md:h-full">
      <h1 className="text-4xl font-bold text-center">
        Choose your Topic and Difficulty
      </h1>
      <p className="text-gray-500 text-lg text-center mt-3">
        Select a topic and difficulty level to start practising!
      </p>

      <p className="md:mt-16 mt-4 text-lg text-center">
        Recommended for you: Word Ladders — Medium
      </p>

      <div className="bg-gray-100 mt-12 rounded-lg flex flex-col lg:px-0 p-2 pb-8">
        <div className="grid md:grid-cols-2 gap-4 m-6">
          {Object.entries(topics).map(([key, topic]) => (
            <button key={key} className={`py-2 px-2 rounded-lg text-white text-center transition-all ${chosenTopic === key ? "bg-yellow-600" : "bg-yellow-400 hover:bg-yellow-600"} border-4 ${chosenTopic === key ? "border-black" : "border-transparent"}`}
              onClick={() => handleSelectTopic(key)}>
              {topic}
            </button>
          ))}
        </div>

        <div className="mt-6 flex md:flex-row flex-col items-center md:gap-8 gap-2 justify-center">
          <h3 className="text-base">Difficulty Level:</h3>
          <div className="flex md:gap-7 gap-2">
            {Object.entries(difficulty_levels).map(([key, level]) => (
              <button key={key} className={`md:w-22 w-18 md:text-[16px] text-[12px] py-3 px-2 rounded-lg text-white text-center transition-all ${difficulty === key
                ? level === "Easy"
                  ? "bg-green-700"
                  : level === "Medium"
                    ? "bg-orange-600"
                    : "bg-red-800"
                : level === "Easy"
                  ? "bg-green-400 hover:bg-green-700"
                  : level === "Medium"
                    ? "bg-orange-400 hover:bg-orange-600"
                    : "bg-red-400 hover:bg-red-800"
                } border-4 ${difficulty === key ? "border-black" : "border-transparent"}`}
                onClick={() => handleSelectDifficulty(key)}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={handleStartPractice}
        className="mt-12 py-3 px-6 disabled:bg-purple-200 bg-purple-500 hover:bg-purple-400 text-white rounded-lg"
        disabled={!chosenTopic || !difficulty}> Start Practice
      </button>

      <NoChildModal isOpen={isNoChildModalOpen} onClose={() => { setIsNoChildModalOpen(false) }} />
    </div>
  )
}

export default CoursesPage