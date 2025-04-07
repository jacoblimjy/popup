import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useChildrenList } from "../hooks/useChildrenList";
import { AttemptedSet } from "../types/AttemptTypes";
import AttemptedSetsApi from "../api/AttemptedSetsApi";
import { difficulty_levels, formatAttemptedQuestions, formatDetailedDate, topics } from "../utils";
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
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isNoChildModalOpen, setIsNoChildModalOpen] = useState(false);
  const [overallPerformance, setOverallPerformance] = useState<OverallPerformance | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // ref to prevent duplicate API calls due to StrictMode in dev (remove in prod)
  const fetchedPages = useRef<Set<number>>(new Set());


  useEffect(() => {
    fetchOverallPerformance();
  }, []);

  useEffect(() => {
    fetchAttemptedSets();
    console.log("Fetching attempted sets", page);
  }, [page]);

  const fetchAttemptedSets = async () => {
    try {
      setIsMoreLoading(true);
      setIsNoChildModalOpen(false);
    
      if (activeChild && !fetchedPages.current.has(page)) {
        fetchedPages.current.add(page); // Mark the page as fetched
  
        const child_id = activeChild.child_id;
        const attemptedSetResponse = await AttemptedSetsApi.getAttemptedSets(child_id as number, page);
  
        if (attemptedSetResponse.length < 10) {
          setHasMore(false);
        }
  
        const formattedResponse = attemptedSetResponse.map((attempt) => ({
          ...attempt,
          attempt_timestamp: formatDetailedDate(attempt.attempt_timestamp),
          attempted_questions: formatAttemptedQuestions(attempt.attempted_questions),
        }));
  
        console.log("next page", formattedResponse);
        setAttempts(prev => [...prev, ...formattedResponse]);
      } else if (!activeChild) {
        console.log("No active child found");
        setIsNoChildModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching attempted sets:", error);
    } finally {
      setIsMoreLoading(false);
    }
  };

  const fetchOverallPerformance = async () => {
    try {
      setIsLoading(true);
      if (activeChild) {
        const child_id = activeChild.child_id;
        const overallResponse = await ChildPerformanceApi.getOverallPerformanceByChildId(child_id);

        const overall = {
          total_questions_completed: parseInt(overallResponse.data.total_questions_completed),
          overall_score: parseFloat(overallResponse.data.overall_score),
          average_time_per_question: parseFloat((overallResponse.data.average_time_per_question / 1000).toFixed(2)), // Convert ms to s
        };
        setOverallPerformance(overall);
      } else {
        console.log("No active child found");
        setIsNoChildModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching overall performance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isMoreLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1);
          }
        },
        { threshold: 1.0 }
      );
      if (node) observer.current.observe(node);
    },
    [isMoreLoading, hasMore]
  );

  const handleReviewAttempt = (setId: number) => {
    console.log(`Reviewing attempt ${setId}`);
    navigate(`/results/${setId}?review=true`);
  };

  const handleRedoAttempt = (setId: number) => {
    console.log(`Redoing attempt ${setId}`);
    navigate(`/redo/${setId}`);
  };

  const getDifficultyTagCSS = (difficultyId: number) => {
    switch (difficultyId) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

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

                const isLastElement = index === attempts.length - 1;

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-3"
                    ref={isLastElement ? lastPostElementRef : null} // Attach ref to the last element
                  >
                    <p>{topicName} #{topicCounters[topicName]}</p> {/* Unique numbering per topic */}
                    <div className="flex justify-between">
                      <div className="flex flex-col gap-1 text-sm text-gray-500">
                        <div>Difficulty: <span className={`${getDifficultyTagCSS(attempt.difficulty_id)} px-1 rounded`}>{difficulty_levels[attempt.difficulty_id as keyof typeof difficulty_levels]}</span></div>
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
                    {index !== attempts.length - 1 && <hr className="border-gray-200 w-4/5 m-auto" />}
                  </div>
                );
              });
            })() :
              <p>No attempts yet</p>
            }
            {isMoreLoading && <p className="text-center">Loading More...</p>}
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
