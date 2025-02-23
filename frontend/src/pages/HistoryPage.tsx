import { useNavigate } from "react-router-dom";

const HistoryPage = () => {
  const navigate = useNavigate();

  const name = "Jane";
  const statistics = {
    attempted: 50,
    completed: 48,
    averageScore: 98.8,
  };

  const attempts = [
    {
      id: 1,
      difficulty: "Hard",
      topic: "Use a Rule to Make a Word",
      attemptedOn: "5th Feb 2025",
      score: 92,
      total_score: 100,
    },
    {
      id: 2,
      difficulty: "Medium",
      topic: "Use a Rule to Make a Word",
      attemptedOn: "5th Feb 2025",
      score: 93,
      total_score: 100,
    },
    {
      id: 3,
      difficulty: "Easy",
      topic: "Use a Rule to Make a Word",
      attemptedOn: "6th Feb 2025",
      score: 94,
      total_score: 100,
    },
  ];

  const handleReviewAttempt = (attemptId: number) => {
    console.log(`Reviewing attempt ${attemptId}`);
    navigate("/review/" + attemptId);
  };
  return (
    <div className="h-full flex flex-col items-center p-6">
      <div className="flex flex-col items-center gap-3 border border-gray-200 rounded-lg p-8 w-xl">
        <div className="size-14 rounded-full ring-2 ring-white bg-[#f1c40e] text-center text-white flex items-center justify-center">
          <p className="text-lg">{name.charAt(0)}</p>
        </div>
        <p className="text-base text-center">{name}</p>
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

        {attempts.map((attempt, index) => (
          <div key={index} className="flex flex-col gap-3">
            <p>Attempt #{attempt.id}</p>
            <div className="flex justify-between">
              <div className="flex flex-col gap-1 text-sm text-gray-500">
                <p>Difficulty: {attempt.difficulty}</p>
                <p>Topic: {attempt.topic}</p>
                <p>Attempted On: {attempt.attemptedOn}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p>
                  Score: {attempt.score}/{attempt.total_score}
                </p>
                <button 
                  onClick={() => handleReviewAttempt(attempt.id)}
                  className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Review
                </button>
              </div>
            </div>
            {index != attempts.length - 1 && <hr className="border-gray-200 w-4/5 m-auto"/>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
