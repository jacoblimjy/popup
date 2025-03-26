import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Question, QuestionApiResponse } from "../types/QuestionTypes";
import Loader from "../components/Loader";
import wallpaper from "../assets/wallpaper.jpg";
import { ArrowLeft } from "lucide-react";
import QuestionApi from "../api/QuestionApi";
import { getMinutes, getSeconds, insertAnswerAtRandomIndex } from "../utils";
import AttemptedSetsApi from "../api/AttemptedSetsApi";
import { useChildrenList } from "../hooks/useChildrenList";


const QuestionsPage = () => {
  const navigate = useNavigate();
  const { activeChild } = useChildrenList();
  const { topic_id, difficulty_id } = useParams();
  const [questionList, setQuestionList] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [childAnswer, setChildAnswer] = useState<string>("");
  const [elapsedTime, setElapsedTime] = useState(0); // Stopwatch state
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const totalStopwatchRef = useRef<number | null>(null); // Ref to store the interval ID

  useEffect(() => {
    getQuestions();
  }, []);

  useEffect(() => {
    // Start the stopwatch for the current question
    const timer = setInterval(() => {
      setElapsedTime((prevTime) => prevTime + 100);
    }, 100);

    // Clear the timer when the question changes or component unmounts
    return () => clearInterval(timer);
  }, [currentQuestionIndex]);

  const getQuestions = async () => {
    if (!topic_id || !difficulty_id) {
      console.error("Missing topic_id or difficulty_id");
      return;
    }

    console.log(
      `Call getQuestions API with topic_id: ${topic_id} and difficulty_id: ${difficulty_id}`
    );
    setIsLoading(true);

    setTimeout(async () => {
      const apiResponse = await QuestionApi.getPracticeQuestions(
        topic_id,
        difficulty_id
      );

      const questions: Question[] = apiResponse.map((question: QuestionApiResponse) => {
        return {
          question_id: question.question_id,
          question_text: question.question_text,
          answer_format: question.answer_format,
          correct_answer: question.correct_answer,
          options: insertAnswerAtRandomIndex(
            question.distractors,
            question.correct_answer
          ),
          explanation: question.explanation,
          topic_id: question.topic_id,
          difficulty_id: question.difficulty_id,
          selectedOption: null,
          time_taken: 0,
        };
      });

      setQuestionList(questions);
      setCurrentQuestionIndex(0);
      setElapsedTime(0); // Reset stopwatch
      setTotalElapsedTime(0); // Reset total time
      startTotalStopwatch(); // Start total stopwatch after questions are set
      setIsLoading(false);
    }, 1000);
  };

  const startTotalStopwatch = () => {
    // Clear any existing interval
    if (totalStopwatchRef.current) {
      clearInterval(totalStopwatchRef.current);
    }

    // Start a new interval
    totalStopwatchRef.current = setInterval(() => {
      setTotalElapsedTime((prevTime) => prevTime + 100);
    }, 100);
  };

  const stopTotalStopwatch = () => {
    if (totalStopwatchRef.current) {
      clearInterval(totalStopwatchRef.current);
      totalStopwatchRef.current = null;
    }
  };

  const handleSelectOption = (option: string) => {
    if (childAnswer === option) {
      setChildAnswer("");
      return;
    }
    setChildAnswer(option);
  };

  const handleContinue = () => {
    // Update selected option in the current question
    const updatedQuestionList = [...questionList];
    updatedQuestionList[currentQuestionIndex].child_answer = childAnswer;
    updatedQuestionList[currentQuestionIndex].time_taken = elapsedTime;
    setQuestionList(updatedQuestionList);

    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setChildAnswer("");
    setElapsedTime(0); // Reset stopwatch for the next question
  };

  const handleSubmit = async () => {
    const updatedQuestionList = [...questionList];
    updatedQuestionList[currentQuestionIndex].child_answer = childAnswer;
    updatedQuestionList[currentQuestionIndex].time_taken = elapsedTime;
    setQuestionList(updatedQuestionList);

    stopTotalStopwatch(); // Stop the total stopwatch on submit

    console.log(updatedQuestionList);

    // TODO: Call submit API
    try {
      const total_questions = questionList.length;
      const correct_answers = questionList.filter(
        (question) => question.correct_answer === question.child_answer
      ).length;
      const score = (correct_answers / total_questions * 100).toFixed(2);
      await AttemptedSetsApi.createAttemptedSet({
        child_id: activeChild!.child_id,
        topic_id: parseInt(topic_id || ""),
        total_questions: total_questions,
        correct_answers: correct_answers,
        score: parseFloat(score),
        time_spent: totalElapsedTime,

      });
      navigate("/results", { state: { questions_attempt: updatedQuestionList, total_time: totalElapsedTime, total_questions: total_questions, correct_answers: correct_answers, score: score } });
    } catch (error) {
      console.error("Error submitting answers", error);
    }
  };

  return (
    <div className="relative my-auto h-full">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      <div className="absolute inset-0 bg-white/70"></div>
      {isLoading ? (
        <Loader loading={isLoading} />
      ) : (
        <div className="relative h-full">
          <button
            className="absolute top-4 left-4 bg-gray-800 text-white py-2 px-4 rounded"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </button>

          <div className="absolute flex top-2 right-4 text-lg font-bold mt-4 bg-white text-black p-2 rounded-lg border-2 border-gray-500 shadow-lg w-24 justify-center">
            <p className="mx-1">{getMinutes(elapsedTime)}</p>
            <span className="mx-1">:</span>
            <p className="mx-1">{getSeconds(elapsedTime)}</p>
          </div>

          {questionList.length > 0 ? (
            <div className="flex flex-col justify-center items-center gap-2 p-20 z-10 h-full">
              <h4 className="text-black text-2xl font-bold w-full">
                Question {currentQuestionIndex + 1}
              </h4>
              <div className="bg-gray-200 w-full h-1/4 rounded-lg p-4">
                <p className="text-md">
                  {questionList[currentQuestionIndex]?.question_text}
                </p>
              </div>
              <div className="flex md:flex-row flex-col w-full gap-4 space-between mt-10 px-2">
                {questionList[currentQuestionIndex]?.options.map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(option)}
                      className={`${childAnswer === option
                        ? "bg-[#a18402]"
                        : "bg-[#f1c40e]"
                        } text-white py-2 px-4 rounded-lg mt-2 w-full`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={
                  currentQuestionIndex === questionList.length - 1
                    ? handleSubmit
                    : handleContinue
                }
                className="disabled:bg-purple-300 bg-purple-600 text-white py-2 px-4 rounded-lg mt-20"
                disabled={childAnswer === ""}
              >
                {currentQuestionIndex === questionList.length - 1
                  ? "Submit"
                  : "Continue"}
              </button>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full p-20 z-10">
              <div className="bg-gray-200 w-full h-1/4 rounded-lg p-4">
                <p className="text-md">
                  No questions available for this topic and difficulty level.
                  Please contact admin to generate more questions.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionsPage;