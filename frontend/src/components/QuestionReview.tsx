import { AttemptedQuestion } from "../types/AttemptTypes";
import { formatTime } from "../utils";

interface QuestionReviewProps {
  question: AttemptedQuestion;
  question_number: number;
}

const QuestionReview = ({ question: { question_text, correct_answer, options, child_answer, time_spent, explanation }, question_number }: QuestionReviewProps) => {
  return (
    <div className="flex flex-col p-4 gap-4">
      <p className="text-sm font-medium">Question {question_number + 1}</p>
      <p className="text-sm text-gray-500">{question_text}</p>
      <div className="bg-[#f1c40e] w-fit rounded-md p-2 text-gray-600 text-sm">
        <p>Time Taken: {formatTime(time_spent)}</p>
      </div>
      <div className="flex md:flex-row flex-col w-full gap-8 md:h-[200px]">
        <div className="flex flex-col gap-2 rounded-md border border-gray-300 md:w-2/5">
          {options.map((option, index) => (
            <div
              key={index}
              className={`flex items-center flex-1 gap-2 p-2 ${option === correct_answer
                  ? 'bg-green-100'
                  : option === child_answer
                    ? 'bg-red-100'
                    : ''
                } ${index === 0 ? 'rounded-t-md' : ''} ${index === options.length - 1 ? 'rounded-b-md' : ''
                }`}
            >
              <div className={`w-6 h-6 flex items-center justify-center border border-gray-300 rounded-full ${option === correct_answer ? 'bg-green-500' : option === child_answer ? 'bg-red-500' : ''}`}>
                {option === correct_answer ? (
                  <span className="text-white">✔</span>
                ) : option === child_answer ? (
                  <span className="text-white">✘</span>
                ) : null}
              </div>
              <p className="text-sm flex items-center">{option}</p>
              {option === correct_answer && correct_answer === child_answer && <p className="flex items-center text-sm text-green-600">You answered correctly</p>}
              {option === correct_answer && correct_answer !== child_answer && <p className="flex items-center text-sm text-green-600">Correct Answer</p>}
              {option === child_answer && child_answer !== correct_answer && <p className="flex items-center text-sm text-red-600">Your Answer</p>}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4 grow-1 rounded-md border border-gray-300 p-4 md:w-3/5">
          <p className="text-sm font-medium">Explanation of the answer</p>
          <div className="max-h-[300px] overflow-scroll">
            <p className="text-sm text-gray-500">{explanation}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionReview