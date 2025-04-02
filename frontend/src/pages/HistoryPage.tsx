import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildrenList } from "../hooks/useChildrenList";
import { AttemptedSet, GetAttemptedSetResponse } from "../types/AttemptTypes";
import AttemptedSetsApi from "../api/AttemptedSetsApi";
import { formatAttemptedQuestions, formatDetailedDate, topics } from "../utils";
import Loader from "../components/Loader";
import NoChildModal from "../components/NoChildModal";
import { useAuth } from "../hooks/useAuth";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { activeChild } = useChildrenList();
  const { isAuthLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [attempts, setAttempts] = useState<AttemptedSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoChildModalOpen, setIsNoChildModalOpen] = useState(false);

  useEffect(() => {
    fetchAttemptedSets();

  }, [activeChild]);

  const fetchAttemptedSets = async () => {
    setIsLoading(true);
    setIsNoChildModalOpen(false);
    if (activeChild) {
      const response: GetAttemptedSetResponse[] = await AttemptedSetsApi.getAttemptedSets(activeChild.child_id as number, page);

      const formattedResponse = response.map((attempt) => ({
        ...attempt,
        attempt_timestamp: formatDetailedDate(attempt.attempt_timestamp),
        attempted_questions: formatAttemptedQuestions(attempt.attempted_questions),
      }));
      console.log(formattedResponse);
      setAttempts([...attempts, ...formattedResponse]);
      setPage(page + 1);
      setIsLoading(false);
    } else {
      setIsNoChildModalOpen(true);
    }
  }

  const statistics = {
    attempted: 50,
    completed: 48,
    averageScore: 98.8,
  };

  const handleReviewAttempt = (setId: number) => {
    console.log(`Reviewing attempt ${setId}`);
    navigate(`/results/${setId}?review=true`);
  };
  return (
    <div className="relative h-full">
      {isLoading || isAuthLoading ? <Loader loading={isLoading || isAuthLoading} /> :
        <div className="flex flex-col items-center p-6 h-full w-full">
          <div className="flex flex-col items-center gap-3 border border-gray-200 rounded-lg p-8 w-xl">
            <div className="size-14 rounded-full ring-2 ring-white bg-[#f1c40e] text-center text-white flex items-center justify-center">
              <p className="text-lg">{activeChild?.child_name.charAt(0)}</p>
            </div>
            <p className="text-base text-center">{activeChild?.child_name}</p>
            <hr className="border-gray-300 w-full" />
            <div className="flex gap-3 w-3/4 justify-around items-center">
              <div className="flex flex-col">
                <p className="text-base font-medium">{statistics.attempted}</p>
                <p className="text-sm text-gray-500">Attempted</p>
              </div>
              <div className="border-l-1 border-gray-300 h-3/4"></div>
              <div className="flex flex-col">
                <p className="text-base font-medium">{statistics.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="border-l-1 border-gray-300 h-3/4"></div>
              <div className="flex flex-col">
                <p className="text-base font-medium">{statistics.averageScore}%</p>
                <p className="text-sm text-gray-500">Average Score</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 w-4/5">
            <h3 className="font-semibold">Attempt History</h3>
            {attempts.length > 0 ? attempts.map((attempt, index) => (
              <div key={index} className="flex flex-col gap-3">
                <p>Attempt #{index + 1}</p>
                <div className="flex justify-between">
                  <div className="flex flex-col gap-1 text-sm text-gray-500">
                    <p>Difficulty: Hard</p>
                    <p>Topic: {topics[attempt.topic_id as keyof typeof topics]}</p>
                    <p>Attempted On: {attempt.attempt_timestamp}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p>
                      Score: {attempt.correct_answers}/{attempt.total_questions}
                    </p>
                    <button
                      onClick={() => handleReviewAttempt(attempt.set_id)}
                      className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none w-24"
                    >
                      Review
                    </button>
                  </div>
                </div>
                {index != attempts.length - 1 && <hr className="border-gray-200 w-4/5 m-auto" />}
              </div>
            )) :
              <p>No attempts yet</p>
            }
          </div>

        </div>
      }
      <NoChildModal
        isOpen={isNoChildModalOpen}
        onClose={() => setIsNoChildModalOpen(false)}
      />
    </div>
  );
};

export default HistoryPage;
