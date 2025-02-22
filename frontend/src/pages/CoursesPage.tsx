import { useNavigate } from "react-router-dom";
import { useState } from "react";

const topics = [
    "Use a Rule to Make a Word",
    "Complete a Word Pair",
    "Word Ladders",
    "Anagram in a Sentence",
];

const levels = ["Easy", "Medium", "Hard"]

const CoursesPage = () => {
    const navigate = useNavigate();
    const [chosenTopic, setTopic] = useState<string | null>(null);
    const [difficulty, setDifficulty] = useState<string | null>(null);

    const handleStartPractice = () => {
        if (chosenTopic && difficulty) {
            navigate(`/courses/${chosenTopic}/${difficulty}/`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
            <h1 className="text-4xl font-bold text-center">
                Choose your Topic and Difficulty
            </h1>
            
            <p className="text-gray-500 text-lg text-center mt-3">
                Select a topic and difficulty level to start practising!
            </p>

            <p className="mt-16 text-lg text-center">
                Recommended for you: Word Ladders — Medium
            </p>

            <div className="bg-gray-50 shadow-md p-10 mt-12 rounded-lg w-[600px] h-[300px] flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4">
                {topics.map((topic) => (
                    <button key={topic} className={`py-3 px-2 rounded-lg text-white text-center transition-all ${
                        chosenTopic === topic ? "bg-yellow-600" : "bg-yellow-400 hover:bg-yellow-600"}`}
                        onClick={() => setTopic(topic)}>
                    {topic}
                    </button>
                ))}
                </div>

                <div className="mt-6 flex items-center gap-8 justify-center">
                    <h3 className="text-lg">Difficulty Level</h3>
                    <div className="flex gap-10">
                    {levels.map((level) => (
                        <button key={level} className={`w-20 py-3 px-2 rounded-lg text-white text-center transition-all ${
                            difficulty === level 
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
                        }`}
                        onClick = {() => setDifficulty(level)}>
                        {level}
                        </button>
                    ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handleStartPractice}
                className="mt-12 py-3 px-6 bg-purple-500 hover:bg-purple-400 text-white rounded-lg"
                disabled={!chosenTopic || !difficulty}> Start Practice
            </button>
        </div>
  )
}

export default CoursesPage