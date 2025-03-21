import { useLocation } from "react-router-dom";
import { Question } from "../types/QuestionTypes";
import QuestionReview from "../components/QuestionReview";

const ResultsPage = () => {
  const location = useLocation();
  const questions_attempt = location.state?.questions_attempt as Question[];
  const score = 7;
  const total_score = 10;

  console.log(questions_attempt)
  return (
    <div className="flex flex-col p-10">
      <p className="text-2xl font-semibold">Review</p>
      <div className="flex flex-col my-4 border-1 border-gray-300 rounded-md">
        <div className="flex flex-col p-4 gap-4">
          <div className="flex justify-between">
            <p className="text-md font-medium">Practice 4</p>
            <div className="inline-flex items-center gap-2">
              <p className="text-md font-medium">Score: {score}/{total_score}</p>
              <div className="w-24 bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#f1c40e] h-2.5 rounded-full"
                  style={{ width: `${(score / total_score) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                {((score / total_score) * 100)}%
              </p>
            </div>
          </div>
          <div className="flex gap-8">
            <p className="text-xs text-gray-400">Attempted on: 12th July 2025 | 12:47pm</p>
            <p className="text-xs text-gray-400">Time Taken: 0:21:17</p>
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

        className="disabled:bg-purple-300 bg-[#f1c40e] text-white py-2 px-4 rounded-lg w-fit mx-auto"
      >Back</button>
    </div>
  )
}

export default ResultsPage