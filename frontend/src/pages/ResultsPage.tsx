import { useNavigate, useParams } from "react-router-dom";
import QuestionReview from "../components/QuestionReview";
import { formatAttemptedQuestions, formatAttemptSetTimestamp, formatTime } from "../utils";
import { useEffect, useState } from "react";
import AttemptedSetsApi from "../api/AttemptedSetsApi";
import { AttemptedSet, GetAttemptedSetResponse } from "../types/AttemptTypes";
import Loader from "../components/Loader";

const ResultsPage = () => {
  const { set_id } = useParams();
  const navigate = useNavigate();
  const [attemptedSet, setAttemptedSet] = useState<AttemptedSet>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAttemptedSet();
  }, [])

  const fetchAttemptedSet = async () => {
    setIsLoading(true);
    const response : GetAttemptedSetResponse = await AttemptedSetsApi.getAttemptedSetBySetId(set_id!);
    const formattedResponse : AttemptedSet = {
      ...response,
      attempted_questions: formatAttemptedQuestions(response.attempted_questions)
    }
    setAttemptedSet(formattedResponse);
    setIsLoading(false);
  }

  return (
    <div className="relative h-full">
      {isLoading ? 
      <Loader loading={isLoading} /> : 
      attemptedSet ? ( // Ensure attemptedSet is defined
        <div className="flex flex-col p-10">
          <p className="text-2xl font-semibold">Review</p>
          <div className="flex flex-col my-4 border-1 border-gray-300 rounded-md">
            <div className="flex flex-col p-4 gap-4">
              <div className="flex md:flex-row gap-5 flex-col justify-between">
                <p className="text-md font-medium">Practice Results</p>
                <div className="inline-flex items-center gap-2">
                  <p className="text-md font-medium">Score: {attemptedSet.correct_answers}/{attemptedSet.total_questions}</p>
                  <div className="w-24 bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-[#f1c40e] h-2.5 rounded-full"
                      style={{ width: `${(attemptedSet.correct_answers / attemptedSet.total_questions) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400">
                    {attemptedSet.score}%
                  </p>
                </div>
              </div>
              <div className="flex gap-8">
                <p className="text-xs text-gray-400">Attempted on: {formatAttemptSetTimestamp(attemptedSet.attempt_timestamp)}</p>
                <p className="text-xs text-gray-400">Time Taken: {formatTime(attemptedSet.time_spent || 0)}</p>
              </div>
            </div>
            <hr className="w-full text-gray-300" />
            {attemptedSet.attempted_questions.map((question, index) => (
              <div key={index}>
                <QuestionReview question={question} question_number={index} />
                {(index !== attemptedSet.attempted_questions.length - 1) && <hr className="w-full text-gray-300" />}
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
      ) : (
        <p className="text-center text-gray-500">No data available</p> // Fallback if attemptedSet is undefined
      )}
    </div>
  );
}

export default ResultsPage