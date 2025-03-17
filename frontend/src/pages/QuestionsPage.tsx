import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { Question } from "../types/QuestionTypes";
import Loader from "../components/Loader";
import wallpaper from "../assets/wallpaper.jpg";
import { ArrowLeft } from "lucide-react";

const QuestionsPage = () => {
  const navigate = useNavigate();
  const {topic_id, difficulty_id} = useParams();
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const options = ["A", "B", "C", "D", "E"];

  useEffect(() => {
    getQuestions();
  },[])

  const getQuestions = async () => {
    console.log(`Call getQuestions API with topic_id: ${topic_id} and difficulty_id: ${difficulty_id}`)
    setIsLoading(true);
    setTimeout(() => {
      const apiResponse = [
        {
          question_id: 1,
          question_text: "What is the capital of France?",
          answer_format: "text",
          correct_answer: "Paris",
          distractors: ["London", "Berlin", "Madrid"],
          topic_id: 1,
          difficulty_id: parseInt(difficulty_id || "1"),
          date_created: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          is_llm_generated: false,
        },
        {
          question_id: 2,
          question_text: "What is 2 + 2?",
          answer_format: "text",
          correct_answer: "4",
          distractors: ["3", "5", "6"],
          topic_id: 1,
          difficulty_id: parseInt(difficulty_id || "1"),
          date_created: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          is_llm_generated: false,
        },
        {
          question_id: 3,
          question_text: "What is the largest planet in our solar system?",
          answer_format: "text",
          correct_answer: "Jupiter",
          distractors: ["Earth", "Mars", "Saturn"],
          topic_id: 1,
          difficulty_id: parseInt(difficulty_id || "1"),
          date_created: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          is_llm_generated: false,
        },
      ];
      const questions = apiResponse.map((question) => {
        return {
          question_id: question.question_id,
          question_text: question.question_text,
          answer_format: question.answer_format,
          correct_answer: question.correct_answer,
          options: insertAnswerAtRandomIndex(question.distractors, question.correct_answer),
          topic_id: question.topic_id,
          difficulty_id: question.difficulty_id,
          is_selected: false,
        }
      });

      setQuestionList(questions);
      setIsLoading(false);
    }, 3000); 
  }

  const insertAnswerAtRandomIndex = (options: string[], correctAnswer: string) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    const newArray = [...options];
    newArray.splice(randomIndex, 0, correctAnswer);
    return newArray;
  }


  return (
    <div className="relative my-auto h-full">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
  
      <div className="absolute inset-0 bg-white/70"></div>
      {isLoading ? <Loader loading={isLoading} />
      :
      <div className="relative flex flex-col justify-center items-center gap-2 p-20 z-10 h-full">
        <button
          className="absolute top-4 left-4 bg-gray-800 text-white py-2 px-4 rounded"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft/>
        </button>
        <h4 className="text-black text-2xl font-bold w-full">Question 1</h4>

        <div className="bg-gray-400 w-full h-1/4 rounded-lg p-4">
          <p className="text-sm">In this questions, the same letter must fit into both sets of brackets, to complete the word in front of the brackets and begin the word after the brackets.</p>
        </div>
        <div className="flex w-full gap-4 space-between mt-10">
          {options.map((option, index) => (
            <button key={index} className="bg-[#f1c40e] text-white py-2 px-4 rounded mt-2 w-full">{option}</button>
          ))}
        </div>
      </div>}
    </div>
  );
  
}

export default QuestionsPage