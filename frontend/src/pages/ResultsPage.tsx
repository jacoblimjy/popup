import { useLocation, useNavigate } from "react-router-dom";
import { Question } from "../types/QuestionTypes";
import QuestionReview from "../components/QuestionReview";
import { formatTime } from "../utils";

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions_attempt = location.state?.questions_attempt as Question[];
  const total_time = location.state?.total_time as number;
  const total_questions = location.state?.total_questions as number;
  const correct_answers = location.state?.correct_answers as number;
  const score = location.state?.score as number;

  return (
    <div className="flex flex-col p-10">
      <p className="text-2xl font-semibold">Review</p>
      <div className="flex flex-col my-4 border-1 border-gray-300 rounded-md">
        <div className="flex flex-col p-4 gap-4">
          <div className="flex md:flex-row gap-5 flex-col justify-between">
            <p className="text-md font-medium">Practice 4</p>
            <div className="inline-flex items-center gap-2">
              <p className="text-md font-medium">Score: {correct_answers}/{total_questions}</p>
              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#f1c40e] h-2.5 rounded-full"
                  style={{ width: `${(correct_answers / total_questions) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                {score}%
              </p>
            </div>
          </div>
          <div className="flex gap-8">
            <p className="text-xs text-gray-400">Attempted on: 12th July 2025 | 12:47pm</p>
            <p className="text-xs text-gray-400">Time Taken: {formatTime(total_time)}</p>
          </div>
        </div>
        <hr className="w-full text-gray-300" />
        {questions_attempt.map((question, index) => (
          <div key={index}>
            <QuestionReview question={question} question_number={index} />
            {(index !== questions_attempt.length - 1) && <hr className="w-full text-gray-300" />}
          </div>
        ))}
      </div>
      <button
        className="bg-[#f1c40e] text-white py-2 px-4 rounded-lg w-fit mx-auto"
        onClick={() => navigate("/")}
      >
        Close
      </button>
    </div>
  )
}

export default ResultsPage