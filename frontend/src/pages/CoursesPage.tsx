import { useNavigate } from "react-router-dom";
import { useState } from "react";

const topics = [
    "Use a Rule to Make a Word",
    "Complete a Word Pair",
    "Word Ladders",
    "Anagram in a Sentence",
];

const CoursesPage = () => {
    const navigate = useNavigate();
    const [chosenTopic, setTopic] = useState(null);

    const handleStartPractice = () => {
        if (chosenTopic) {
            navigate(`/courses/${chosenTopic}`);
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
                        onClick={() => setTopic(chosenTopic)}>
                    {topic}
                    </button>
                ))}
                </div>
            </div>
        </div>
  )
}

export default CoursesPage