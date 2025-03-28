import { AlertTriangle, Timer, Zap } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const AnalyticsPage = () => {
  const sampleAccuracyBarChartData = [
    { name: 'Rule', accuracy: 95 },
    { name: 'Word Pair', accuracy: 85 },
    { name: 'Anagram', accuracy: 90 },
    { name: 'Word Ladders', accuracy: 65 },
  ]

  const sampleTimePieChartData = [
    { name: 'Rule', time: 5 },
    { name: 'Word Pair', time: 8 },
    { name: 'Anagram', time: 7 },
    { name: 'Word Ladders', time: 12 },
  ]

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
            <p className="text-sm text-gray-500">{sampleAccuracyBarChartData[index].accuracy}%</p>
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
            <p className="text-sm text-gray-500">{sampleTimePieChartData[index].time}s</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-10 flex flex-col items-center h-full">
      <h1 className="text-3xl font-bold mb-5">Overall Accuracy: 85%</h1>
      <p className="text-gray-400">You did a great job!</p>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-8 h-2/3">
        <div className="flex flex-col rounded shadow-md p-5 gap-4">
          <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
            <Zap />
          </div>
          <h3 className="my-3 font-semibold text-lg">Fastest Category</h3>
          <p className="text-gray-400">You're quickest at solving Anagrams! You answered time in an average of 5 seconds.</p>
        </div>
        <div className="flex flex-col rounded shadow-md p-5 gap-4">
          <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
            <AlertTriangle />
          </div>
          <h3 className="my-3 font-semibold text-lg">Most Challenging Question Type</h3>
          <p className="text-gray-400">Word Ladders were tricky! You got <span className="font-bold underline">65%</span> correct - keep practicing!</p>
        </div>
        <div className="flex flex-col rounded shadow-md p-5 gap-4">
          <div className="bg-[#f1c40e] text-white rounded-lg w-12 h-12 flex items-center justify-center">
            <Timer />
          </div>
          <h3 className="my-3 font-semibold text-lg">Best Scoring Question Type</h3>
          <p className="text-gray-400">You excelled at solving Anagrams! You got <span className="font-bold underline">95%</span> correct - amazing work!</p>
        </div>
        <div className="flex flex-col rounded shadow-md p-5 gap-4 md:h-full h-[400px]">
          <p className="font-medium">Accuracy by Question Type</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="horizontal" data={sampleAccuracyBarChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis unit="%"/>
              <Tooltip content={<CustomAccuracyTooltip />} />
              <Legend
                content={<CustomAccuracyLegend />}
                wrapperStyle={{paddingTop: 20}}
                payload={[
                  { value: 'Use a Rule to Make a Word', type: 'circle', color: '#8884d8' },
                  { value: 'Complete a Word Pair', type: 'circle', color: '#82ca9d' },
                  { value: 'Anagram in a Sentence', type: 'circle', color: '#ffc658' },
                  { value: 'Word Ladders', type: 'circle', color: '#ff8042' },
                ]}
              />
              <Bar dataKey="accuracy">
                {sampleAccuracyBarChartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col rounded shadow-md p-5 gap-4 md:h-full h-[400px]">
          <p className="font-medium">Time Spent Per Question Type</p>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTimeTooltip />} />
              <Legend
                content={<CustomTimeLegend />}
                wrapperStyle={{paddingTop: 20}}
                payload={[
                  { value: 'Use a Rule to Make a Word', type: 'circle', color: '#8884d8' },
                  { value: 'Complete a Word Pair', type: 'circle', color: '#82ca9d' },
                  { value: 'Anagram in a Sentence', type: 'circle', color: '#ffc658' },
                  { value: 'Word Ladders', type: 'circle', color: '#ff8042' },
                ]}
              />
              <Pie 
                dataKey="time" 
                data={sampleTimePieChartData}
                innerRadius={45}
                outerRadius={80}
                paddingAngle={2}
              >
                {sampleTimePieChartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042"][index % 4]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col rounded shadow-md p-5 gap-4 md:h-full h-[400px]">
          <p className="font-medium">Score Over Time</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sampleScoreLineChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis unit="%"/>
              <XAxis dataKey="name" />
              <Tooltip />
              <Line 
                dataKey="score" 
                stroke="#8884d8"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage