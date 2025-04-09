import { AlertTriangle, Timer, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, PolarAngleAxis, PolarAngleAxisProps, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, YAxis } from "recharts"
import { useChildrenList } from "../hooks/useChildrenList"
import ChildPerformanceApi from "../api/ChildPerformanceApi"
import { ChildPerformance, OverallPerformance } from "../types/ChildPerformanceTypes"
import Loader from "../components/Loader"
import { topics } from "../utils"
import NoChildModal from "../components/NoChildModal"
import { useAuth } from "../hooks/useAuth"

const AnalyticsPage = () => {
  const { activeChild } = useChildrenList();
  const { isAuthLoading } = useAuth();
  const [accuracyBarChartData, setAccuracyBarChartData] = useState<{ name: string; accuracy: number }[]>(
    [
      { name: "Use a Rule to Make a Word", accuracy: 0 },
      { name: "Complete a Word Pair", accuracy: 0 },
      { name: "Anagram in a Sentence", accuracy: 0 },
      { name: "Word Ladders", accuracy: 0 },
    ]
  );
  const [avgTimePieChartData, setAvgTimePieChartData] = useState<{ name: string; time: number }[]>(
    [
      { name: "Use a Rule to Make a Word", time: 0 },
      { name: "Complete a Word Pair", time: 0 },
      { name: "Anagram in a Sentence", time: 0 },
      { name: "Word Ladders", time: 0 },
    ]
  );
  const [questionsCompletedData, setQuestionsCompletedData] = useState<{ name: string; questions: number }[]>(
    [
      { name: "Use a Rule to Make a Word", questions: 0 },
      { name: "Complete a Word Pair", questions: 0 },
      { name: "Anagram in a Sentence", questions: 0 },
      { name: "Word Ladders", questions: 0 },
    ]
  );
  const [fastestCategory, setFastestCategory] = useState<ChildPerformance | null>(null);
  const [challengingCategory, setChallengingCategory] = useState<ChildPerformance | null>(null);
  const [bestCategory, setBestCategory] = useState<ChildPerformance | null>(null);
  const [overallPerformance, setOverallPerformance] = useState<OverallPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoChildModalOpen, setIsNoChildModalOpen] = useState(false);
  const [hasNoData, setHasNoData] = useState(false);


  useEffect(() => {
    fetchChildPerformances();
  }, [activeChild]);

  const fetchChildPerformances = async () => {
    setIsLoading(true)

    if (!activeChild) {
      setIsNoChildModalOpen(true);
      return;
    }

    try {
      setIsNoChildModalOpen(false);

      const child_id = activeChild?.child_id;
      const [performanceResponse, overallResponse] = await Promise.all([
        ChildPerformanceApi.getChildPerformanceByChildId(child_id),
        ChildPerformanceApi.getOverallPerformanceByChildId(child_id)
      ]);
      console.log("Overall Performance Response:", overallResponse);

      if (!performanceResponse.success) {
        console.error("Error fetching child performances:", performanceResponse.error);
        return;
      }

      if (performanceResponse.data.length === 0) {
        setHasNoData(true);
        setIsLoading(false);
        return;
      }

      const data = performanceResponse.data.map((item: ChildPerformance) => ({
        child_id: item.child_id,
        topic_id: item.topic_id,
        total_time_spent: parseFloat((item.total_time_spent / 1000).toFixed(2)), // Convert ms to s
        total_questions_attempted: item.total_questions_attempted,
        average_accuracy_score: item.average_accuracy_score,
        average_time_per_question: parseFloat((item.average_time_per_question / 1000).toFixed(2)), // Convert ms to s
      })) as ChildPerformance[];
      updateAccuracyBarChartData(data);
      updateAverageTimePieChartData(data);
      updateQuestionsCompletedData(data);
      updateFastestCategory(data);
      updateChallengingCategory(data);
      updateBestCategory(data);
      const overall = {
        total_questions_completed: parseInt(overallResponse.data.total_questions_completed),
        overall_score: parseFloat(overallResponse.data.overall_score),
        average_time_per_question: parseFloat((overallResponse.data.average_time_per_question / 1000).toFixed(2)), // Convert ms to s
      }
      setOverallPerformance(overall);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching child performances:", error);
    }
  }

  const updateAccuracyBarChartData = (data: ChildPerformance[]) => {
    const updatedData = data.map((item) => ({
      name: topics[item.topic_id as keyof typeof topics],
      accuracy: item.average_accuracy_score,
    }));

    // Update only the matching topic's accuracy
    setAccuracyBarChartData((prevData) => {
      const mergedData = prevData.map((seed) => {
        const match = updatedData.find((update) => update.name === seed.name);
        return match ? { ...seed, accuracy: match.accuracy } : seed;
      });
      return mergedData;
    });
  }

  const updateAverageTimePieChartData = (data: ChildPerformance[]) => {
    const updatedData = data.map((item) => ({
      name: topics[item.topic_id as keyof typeof topics],
      time: item.average_time_per_question,
    }));

    const mergedData = avgTimePieChartData.map((seed) => {
      const match = updatedData.find((update) => update.name === seed.name);
      return match ? { ...seed, time: match.time } : seed;
    });
    setAvgTimePieChartData(mergedData);
  }

  const updateQuestionsCompletedData = (data: ChildPerformance[]) => {
    const updatedData = data.map((item) => ({
      name: topics[item.topic_id as keyof typeof topics],
      questions: item.total_questions_attempted,
    }));
    const mergedData = questionsCompletedData.map((seed) => {
      const match = updatedData.find((update) => update.name === seed.name);
      return match ? { ...seed, questions: match.questions } : seed;
    });
    setQuestionsCompletedData(mergedData);
  }

  const updateFastestCategory = (data: ChildPerformance[]) => {
    const fastestCategory = data.reduce((prev, current) => {
      return (prev.total_time_spent < current.total_time_spent) ? prev : current;
    });
    setFastestCategory(fastestCategory);
  }

  const updateChallengingCategory = (data: ChildPerformance[]) => {
    const challengingCategory = data.reduce((prev, current) => {
      return (prev.average_accuracy_score < current.average_accuracy_score) ? prev : current;
    }
    );
    setChallengingCategory(challengingCategory);
  }

  const updateBestCategory = (data: ChildPerformance[]) => {
    const bestCategory = data.reduce((prev, current) => {
      return (prev.average_accuracy_score > current.average_accuracy_score) ? prev : current;
    }
    );
    setBestCategory(bestCategory);
  }

  const getPerformanceMessage = (overallScore: number | undefined): string => {
    if (overallScore === undefined) return "No performance data available.";
    if (overallScore >= 90) return "Excellent work! You're doing amazing!";
    if (overallScore >= 75) return "Great job! Keep up the good work!";
    if (overallScore >= 50) return "You're doing well, but there's room for improvement!";
    return "Keep practicing! You'll get better with time!";
  };

  const getMaxAttemptedQuestions = () => {
    return Math.max(...questionsCompletedData.map(item => item.questions));
  }

  interface AccuracyTooltipPayload {
    name: string;
    accuracy: number;
  }

  interface CustomAccuracyTooltipProps {
    active?: boolean;
    payload?: { payload: AccuracyTooltipPayload }[];
  }
  const CustomAccuracyTooltip: React.FC<CustomAccuracyTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-md rounded">
          <p className="font-bold text-sm">{data.name}</p>
          <p className="text-sm">Accuracy: {data.accuracy}%</p>
        </div>
      );
    }
    return null;
  };

  interface CustomAccuracyLegendProps {
    payload?: { value: string; color: string }[];
  }
  const CustomAccuracyLegend: React.FC<CustomAccuracyLegendProps> = ({ payload }) => {
    return (
      <div className="flex flex-col gap-1">
        {payload?.map((entry, index) => (
          <div key={`legend-item-${index}`} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: entry.color }}
                className="w-3 h-3 rounded-full"
              ></div>
              <p className="text-sm text-gray-500">{entry.value}</p>
            </div>
            <p className="text-sm text-gray-500">{accuracyBarChartData[index].accuracy}%</p>
          </div>
        ))}
      </div>
    );
  };

  interface TimeTooltipPayload {
    name: string;
    time: number;
  }

  interface TimeTooltipProps {
    active?: boolean;
    payload?: { payload: TimeTooltipPayload }[];
  }
  const CustomTimeTooltip: React.FC<TimeTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 shadow-md rounded">
          <p className="font-bold text-sm">{data.name}</p>
          <p className="text-sm">Time spent: {data.time}s</p>
        </div>
      );
    }
    return null;
  };

  interface CustomTimeLegendProps {
    payload?: { value: string; color: string }[];
  }
  const CustomTimeLegend: React.FC<CustomTimeLegendProps> = ({ payload }) => {
    return (
      <div className="flex flex-col gap-1">
        {payload?.map((entry, index) => (
          <div key={`legend-item-${index}`} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                style={{ backgroundColor: entry.color }}
                className="w-3 h-3 rounded-full"
              ></div>
              <p className="text-sm text-gray-500">{entry.value}</p>
            </div>
            <p className="text-sm text-gray-500">{avgTimePieChartData[index].time}s</p>
          </div>
        ))}
      </div>
    );
  };


  interface CustomPolarAngleProps extends PolarAngleAxisProps {
    payload: { value: string }; // Ensure payload has a `value` property
  }


  const CustomPolarAngleTick: React.FC<CustomPolarAngleProps> = ({ x, y, payload, textAnchor }) => {
    const text = payload.value;
    // Function to split text into lines without breaking words, with a max line length of 10
    const splitText = (text: string, maxLength: number) => {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word) => {
        if ((currentLine + word).length <= maxLength) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });

      if (currentLine) lines.push(currentLine);
      return lines;
    };

    const lines = splitText(text, 12);

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fill="#666"
        fontSize={12}
      >
        {lines.map((line, index) => (
          <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
            {line}
          </tspan>
        ))}
      </text>
    );
  };

  return (
    <div className="relative p-10 flex flex-col items-center h-full">

      {isLoading || isAuthLoading ? <Loader loading={isLoading || isAuthLoading} /> :
        (hasNoData ?
          <p>No analytics data found. Start a practice to view your statistics here</p>
          :
          <>
            <h1 className="text-3xl font-bold mb-5">Overall Accuracy: {overallPerformance?.overall_score}%</h1>
            <p className="text-gray-400">{getPerformanceMessage(overallPerformance?.overall_score)}</p>
            <div className="grid xl:grid-cols-3 grid-cols-1 gap-8 h-full">
              <div className="flex flex-col rounded shadow-md p-5 gap-4 bg-white">
                <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
                  <Zap />
                </div>
                <h3 className="my-3 font-semibold text-lg">Fastest Category</h3>
                <p className="text-gray-400">You're quickest at solving <span className="font-bold underline">{topics[fastestCategory?.topic_id as keyof typeof topics]}</span>! You answered time in an average of {fastestCategory?.average_time_per_question} seconds.</p>
              </div>
              <div className="flex flex-col rounded shadow-md p-5 gap-4 bg-white">
                <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
                  <AlertTriangle />
                </div>
                <h3 className="my-3 font-semibold text-lg">Most Challenging Question Type</h3>
                <p className="text-gray-400"><span className="font-bold underline">{topics[challengingCategory?.topic_id as keyof typeof topics]}</span> were tricky! You got <span className="font-bold underline">{challengingCategory?.average_accuracy_score}%</span> correct - keep practicing!</p>
              </div>
              <div className="flex flex-col rounded shadow-md p-5 gap-4 bg-white">
                <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
                  <Timer />
                </div>
                <h3 className="my-3 font-semibold text-lg">Best Scoring Question Type</h3>
                <p className="text-gray-400">You excelled at solving <span className="font-bold underline">{topics[bestCategory?.topic_id as keyof typeof topics]}</span>! You got <span className="font-bold underline">{bestCategory?.average_accuracy_score}%</span> correct - amazing work!</p>
              </div>
              <div className="flex flex-col rounded shadow-md p-5 gap-4 xl:h-full h-[400px] bg-white">
                <p className="font-medium">Accuracy by Question Type</p>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="horizontal" data={accuracyBarChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <YAxis unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomAccuracyTooltip />} />
                    <Legend
                      content={<CustomAccuracyLegend />}
                      wrapperStyle={{ paddingTop: 20 }}
                      payload={[
                        { value: 'Use a Rule to Make a Word', type: 'circle', color: '#8884d8' },
                        { value: 'Complete a Word Pair', type: 'circle', color: '#82ca9d' },
                        { value: 'Anagram in a Sentence', type: 'circle', color: '#ffc658' },
                        { value: 'Word Ladders', type: 'circle', color: '#ff8042' },
                      ]}
                    />
                    <Bar dataKey="accuracy">
                      {accuracyBarChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col rounded shadow-md p-5 gap-4 xl:h-full h-[400px] bg-white">
                <p className="font-medium">Average Time Spent Per Question Type</p>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomTimeTooltip />} />
                    <Legend
                      content={<CustomTimeLegend />}
                      wrapperStyle={{ paddingTop: 20 }}
                      payload={[
                        { value: 'Use a Rule to Make a Word', type: 'circle', color: '#8884d8' },
                        { value: 'Complete a Word Pair', type: 'circle', color: '#82ca9d' },
                        { value: 'Anagram in a Sentence', type: 'circle', color: '#ffc658' },
                        { value: 'Word Ladders', type: 'circle', color: '#ff8042' },
                      ]}
                    />
                    <Pie
                      dataKey="time"
                      data={avgTimePieChartData}
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {avgTimePieChartData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col rounded shadow-md p-5 gap-4 xl:h-full h-[400px] bg-white">
                <p className="font-medium">Questions Attempted</p>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart margin={{ left: 100, right: 100 }} data={questionsCompletedData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" tick={(props) => <CustomPolarAngleTick {...props} />} />
                    <PolarRadiusAxis domain={[0, getMaxAttemptedQuestions()]} />
                    <Tooltip />
                    <Radar dataKey="questions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </>
        )
      }
      <NoChildModal
        isOpen={isNoChildModalOpen}
        onClose={() => setIsNoChildModalOpen(false)}
      />
    </div>
  )
}

export default AnalyticsPage