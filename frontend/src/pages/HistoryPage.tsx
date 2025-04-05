import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildrenList } from "../hooks/useChildrenList";
import { AttemptedSet } from "../types/AttemptTypes";
import AttemptedSetsApi from "../api/AttemptedSetsApi";
import { formatAttemptedQuestions, formatDetailedDate, topics } from "../utils";
import Loader from "../components/Loader";
import NoChildModal from "../components/NoChildModal";
import { useAuth } from "../hooks/useAuth";
import { OverallPerformance } from "../types/ChildPerformanceTypes";
import ChildPerformanceApi from "../api/ChildPerformanceApi";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { activeChild } = useChildrenList();
  const { isAuthLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [attempts, setAttempts] = useState<AttemptedSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoChildModalOpen, setIsNoChildModalOpen] = useState(false);
  const [overallPerformance, setOverallPerformance] = useState<OverallPerformance | null>(null);


  useEffect(() => {
    fetchAttemptedSets();

  }, []);

  const fetchAttemptedSets = async () => {
    try {
      setIsLoading(true);
      setIsNoChildModalOpen(false);
      if (activeChild) {
        const child_id = activeChild.child_id;
        const [attemptedSetResponse, overallResponse] = await Promise.all([
          AttemptedSetsApi.getAttemptedSets(activeChild.child_id as number, page),
          ChildPerformanceApi.getOverallPerformanceByChildId(child_id)
        ]);

        const formattedResponse = attemptedSetResponse.map((attempt) => ({
          ...attempt,
          attempt_timestamp: formatDetailedDate(attempt.attempt_timestamp),
          attempted_questions: formatAttemptedQuestions(attempt.attempted_questions),
        }));
        console.log(formattedResponse);
        setAttempts([...attempts, ...formattedResponse]);
        setPage(page + 1);
        const overall = {
          total_questions_completed: parseInt(overallResponse.data.total_questions_completed),
          overall_score: parseFloat(overallResponse.data.overall_score),
          average_time_per_question: parseFloat((overallResponse.data.average_time_per_question / 1000).toFixed(2)), // Convert ms to s
        }
        setOverallPerformance(overall);
        setIsLoading(false);
      } else {
        console.log("No active child found");
        setIsNoChildModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching attempted sets:", error);
      // setIsLoading(false);
    }
  }

  const handleReviewAttempt = (setId: number) => {
    console.log(`Reviewing attempt ${setId}`);
    navigate(`/results/${setId}?review=true`);
  };

  const handleRedoAttempt = (setId: number) => {
    console.log(`Redoing attempt ${setId}`);
    navigate(`/redo/${setId}`);
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
                <p className="text-base font-medium">{overallPerformance?.total_questions_completed}</p>
                <p className="text-sm text-gray-500">Attempted</p>
              </div>
              <div className="border-l-1 border-gray-300 h-3/4"></div>
              <div className="flex flex-col">
                <p className="text-base font-medium">{overallPerformance?.overall_score}%</p>
                <p className="text-sm text-gray-500">Average Score</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 mt-6 w-4/5">
            <h3 className="font-semibold">Attempt History</h3>
            {attempts.length > 0 ? (() => {
              const topicCounters: { [key: string]: number } = {}; // Object to track counters for each topic

              return attempts.map((attempt, index) => {
                const topicName = topics[attempt.topic_id as keyof typeof topics];
                if (!topicCounters[topicName]) {
                  topicCounters[topicName] = 1; // Initialize counter for the topic
                } else {
                  topicCounters[topicName] += 1; // Increment counter for the topic
                }

                return (
                  <div key={index} className="flex flex-col gap-3">
                    <p>{topicName} #{topicCounters[topicName]}</p> {/* Unique numbering per topic */}
                    <div className="flex justify-between">
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <p>Difficulty: Hard</p>
                        <p>Topic: {topicName}</p>
                        <p>Attempted On: {attempt.attempt_timestamp}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-center">
                        <p>
                          Score: {attempt.correct_answers}/{attempt.total_questions}
                        </p>
                        <div className="flex gap-2">
                          <button
                            className="py-2 px-1 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none w-20"
                            onClick={() => handleRedoAttempt(attempt.set_id)}
                          >
                            Redo
                          </button>
                          <button
                            onClick={() => handleReviewAttempt(attempt.set_id)}
                            className="py-2 px-1 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none w-20"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    </div>
                    {index != attempts.length - 1 && <hr className="border-gray-200 w-4/5 m-auto" />}
                  </div>
                );
              });
            })() :
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
