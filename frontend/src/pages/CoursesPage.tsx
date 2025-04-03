import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { difficulty_levels, topics } from "../utils";
import NoChildModal from "../components/NoChildModal";
import { useChildrenList } from "../hooks/useChildrenList";

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
        <div className="flex flex-grow flex-col items-center justify-center bg-white p-6">
            <h1 className="text-4xl font-bold text-center">
                Choose your Topic and Difficulty
            </h1>

            <p className="text-gray-500 text-lg text-center mt-3">
                Select a topic and difficulty level to start practising!
            </p>

            <p className="mt-16 text-lg text-center">
                Recommended for you: Word Ladders — Medium
            </p>

            <div className="bg-gray-100 p-10 mt-12 rounded-lg w-[600px] h-[300px] flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(topics).map(([key, topic]) => (
                        <button key={key} className={`py-2 px-2 rounded-lg text-white text-center transition-all ${chosenTopic === key ? "bg-yellow-600" : "bg-yellow-400 hover:bg-yellow-600"} border-4 ${chosenTopic === key ? "border-black" : "border-transparent"}`}
                            onClick={() => handleSelectTopic(key)}>
                            {topic}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex items-center gap-8 justify-center">
                    <h3 className="text-lg">Difficulty Level</h3>
                    <div className="flex gap-10">
                        {Object.entries(difficulty_levels).map(([key, level]) => (
                            <button key={key} className={`w-22 py-3 px-2 rounded-lg text-white text-center transition-all ${difficulty === key
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

            <NoChildModal isOpen={isNoChildModalOpen} onClose={() => {setIsNoChildModalOpen(false)}}/>
        </div>
    )
}

export default CoursesPage