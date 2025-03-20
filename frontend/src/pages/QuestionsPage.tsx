import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { Question, QuestionApiResponse } from "../types/QuestionTypes";
import Loader from "../components/Loader";
import wallpaper from "../assets/wallpaper.jpg";
import { ArrowLeft } from "lucide-react";
import QuestionApi from "../api/QuestionApi";

const QuestionsPage = () => {
  const navigate = useNavigate();
  const { topic_id, difficulty_id } = useParams();
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");

  useEffect(() => {
    getQuestions();
  }, [])

  const getQuestions = async () => {
    if (!topic_id || !difficulty_id) {
      console.error("Missing topic_id or difficulty_id");
      return;
    }
    
    console.log(`Call getQuestions API with topic_id: ${topic_id} and difficulty_id: ${difficulty_id}`)
    setIsLoading(true);

    // timeout to simulate fetching data
    setTimeout(async () => {
      const apiResponse = await QuestionApi.getPracticeQuestions(topic_id, difficulty_id);

      const questions = apiResponse.map((question : QuestionApiResponse) => {
        return {
          question_id: question.question_id,
          question_text: question.question_text,
          answer_format: question.answer_format,
          correct_answer: question.correct_answer,
          options: insertAnswerAtRandomIndex(question.distractors, question.correct_answer),
          topic_id: question.topic_id,
          difficulty_id: question.difficulty_id,
          selectedOption: null
        }
      });

      setQuestionList(questions);
      setCurrentQuestionIndex(0);
      setIsLoading(false);
    }, 1000);
  }

  const insertAnswerAtRandomIndex = (options: string[], correctAnswer: string) => {
    const randomIndex = Math.floor(Math.random() * options.length);
    const newArray = [...options];
    newArray.splice(randomIndex, 0, correctAnswer);
    return newArray;
  }

  const handleSelectOption = (option: string) => {
    if (selectedOption === option) {
      setSelectedOption("");
      return;
    }
    setSelectedOption(option);
  }

  const handleContinue = () => {
    // update selected option in current question
    const updatedQuestionList = [...questionList];
    updatedQuestionList[currentQuestionIndex].selectedOption = selectedOption;
    setQuestionList(updatedQuestionList);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setSelectedOption("");
  }

  const handleSubmit = () => {
    const updatedQuestionList = [...questionList];
    updatedQuestionList[currentQuestionIndex].selectedOption = selectedOption;
    setQuestionList(updatedQuestionList);

    console.log(updatedQuestionList);
    // TODO: Call submit api
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
            <ArrowLeft />
          </button>
          <h4 className="text-black text-2xl font-bold w-full">Question {currentQuestionIndex + 1}</h4>

          <div className="bg-gray-200 w-full h-1/4 rounded-lg p-4">
            <p className="text-sm">{questionList[currentQuestionIndex]?.question_text}</p>
          </div>
          <div className="flex md:flex-row flex-col w-full gap-4 space-between mt-10 px-2">
            {questionList[currentQuestionIndex]?.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectOption(option)}
                className={`${selectedOption === option ? 'bg-[#a18402]' : 'bg-[#f1c40e]'} text-white py-2 px-4 rounded-lg mt-2 w-full`}
              >
                {option}
              </button>
            ))}
          </div>
          <button 
            onClick={currentQuestionIndex === questionList.length - 1 ? handleSubmit : handleContinue}
            className="disabled:bg-purple-300 bg-purple-600 text-white py-2 px-4 rounded-lg mt-20"
            disabled={selectedOption === ""}
          >
            {currentQuestionIndex === questionList.length - 1 ? 'Submit' : 'Continue'}
          </button>
        </div>
      }
    </div>
  );

}

export default QuestionsPage