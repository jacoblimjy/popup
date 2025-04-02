import { AlertTriangle, Timer, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useChildrenList } from "../hooks/useChildrenList"
import ChildPerformanceApi from "../api/ChildPerformanceApi"
import { ChildPerformance, OverallPerformance } from "../types/ChildPerformanceTypes"
import Loader from "../components/Loader"
import { topics } from "../utils"

const AnalyticsPage = () => {
  const { activeChild } = useChildrenList();
  const [accuracyBarChartData, setAccuracyBarChartData] = useState<{ name: string; accuracy: number }[]>([]);
  const [avgTimePieChartData, setAvgTimePieChartData] = useState<{ name: string; time: number }[]>([]);
  const [questionsCompletedData, setQuestionsCompletedData] = useState<{ name: string; questions: number }[]>([]);
  const [fastestCategory, setFastestCategory] = useState<ChildPerformance | null>(null);
  const [challengingCategory, setChallengingCategory] = useState<ChildPerformance | null>(null);
  const [bestCategory, setBestCategory] = useState<ChildPerformance | null>(null);
  const [overallPerformance, setOverallPerformance] = useState<OverallPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const sampleScoreLineChartData = [
    { name: '1', score: 85 },
    { name: '2', score: 90 },
    { name: '3', score: 95 },
    { name: '4', score: 80 },
    { name: '5', score: 100 },
    { name: '6', score: 75 },
    { name: '7', score: 95 },
    { name: '8', score: 90 },
    { name: '9', score: 85 },
    { name: '10', score: 95 },
  ]

  useEffect(() => {
    if (activeChild) {
      fetchChildPerformances();
    }
  }, [activeChild]);

  const fetchChildPerformances = async () => {
    if (!activeChild) return;

    try {
      setIsLoading(true)
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
    setAccuracyBarChartData(updatedData);
  }

  const updateAverageTimePieChartData = (data: ChildPerformance[]) => {
    const updatedData = data.map((item) => ({
      name: topics[item.topic_id as keyof typeof topics],
      time: item.average_time_per_question,
    }));
    setAvgTimePieChartData(updatedData);
  }

  const updateQuestionsCompletedData = (data: ChildPerformance[]) => {
    const updatedData = data.map((item) => ({
      name: topics[item.topic_id as keyof typeof topics],
      questions: item.total_questions_attempted,
    }));
    setQuestionsCompletedData(updatedData);
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

  return (
    <div className="relative p-10 flex flex-col items-center h-full">

      {isLoading ? <Loader loading={isLoading} /> : <><h1 className="text-3xl font-bold mb-5">Overall Accuracy: {overallPerformance?.overall_score}%</h1>
        <p className="text-gray-400">{getPerformanceMessage(overallPerformance?.overall_score)}</p>
        <div className="grid xl:grid-cols-3 grid-cols-1 gap-8 h-full">
          <div className="flex flex-col rounded shadow-md p-5 gap-4">
            <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
              <Zap />
            </div>
            <h3 className="my-3 font-semibold text-lg">Fastest Category</h3>
            <p className="text-gray-400">You're quickest at solving <span className="font-bold underline">{topics[fastestCategory?.topic_id as keyof typeof topics]}</span>! You answered time in an average of {fastestCategory?.average_time_per_question} seconds.</p>
          </div>
          <div className="flex flex-col rounded shadow-md p-5 gap-4">
            <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
              <AlertTriangle />
            </div>
            <h3 className="my-3 font-semibold text-lg">Most Challenging Question Type</h3>
            <p className="text-gray-400"><span className="font-bold underline">{topics[challengingCategory?.topic_id as keyof typeof topics]}</span> were tricky! You got <span className="font-bold underline">{challengingCategory?.average_accuracy_score}%</span> correct - keep practicing!</p>
          </div>
          <div className="flex flex-col rounded shadow-md p-5 gap-4">
            <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
              <Timer />
            </div>
            <h3 className="my-3 font-semibold text-lg">Best Scoring Question Type</h3>
            <p className="text-gray-400">You excelled at solving <span className="font-bold underline">{topics[bestCategory?.topic_id as keyof typeof topics]}</span>! You got <span className="font-bold underline">{bestCategory?.average_accuracy_score}%</span> correct - amazing work!</p>
          </div>
          <div className="flex flex-col rounded shadow-md p-5 gap-4 xl:h-full h-[400px]">
            <p className="font-medium">Accuracy by Question Type</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="horizontal" data={accuracyBarChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <YAxis unit="%" />
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
          <div className="flex flex-col rounded shadow-md p-5 gap-4 xl:h-full h-[400px]">
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
          <div className="flex flex-col rounded shadow-md p-5 gap-4 xl:h-full h-[400px]">
            <p className="font-medium">Questions Attempted</p>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={questionsCompletedData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, getMaxAttemptedQuestions()]}/>
                <Tooltip />
                <Radar dataKey="questions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div></>}
    </div>
  )
}

export default AnalyticsPage