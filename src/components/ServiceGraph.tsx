import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataContext } from '../App';
interface ServiceGraphProps {
  citizenId: string | null;
  showAlert?: boolean;
  currentWeek: number;
  currentYear: number;
}
export const ServiceGraph: React.FC<ServiceGraphProps> = ({
  citizenId,
  currentWeek,
  currentYear
}) => {
  const data = useContext(DataContext);

  // Find the selected citizen or use the first one as default
  const citizen = citizenId ? data?.citizens.find(c => c.id === citizenId) : data?.citizens[0];
  // If no citizen is found, show a placeholder
  if (!citizen) {
    return <div className="h-64 flex items-center justify-center text-gray-500">
        Vælg en borger for at se grafen
      </div>;
  }
  // Modify the data for Borger 3 when alerts are hidden
  
  // Transform pathwayData into an array of weekly data objects per pathwayId
  // Structure: { [pathwayId]: Array<{ week, visiteret, disponeret }> }
  const pathwayWeeklyData: Record<number, Array<{ week: string; visiteret: number; disponeret: number }>> = {};
  if (citizen.pathwayData) {
    Object.entries(citizen.pathwayData).forEach(([pathwayId, pathway]) => {
      pathwayWeeklyData[Number(pathwayId)] = [];
      Object.entries(pathway).forEach(([week, data]) => {
        pathwayWeeklyData[Number(pathwayId)].push({
          week,
          visiteret: data.total.visiteret,
          disponeret: data.total.disponeret
        });
      });
    });
  }

  // Gather all unique weeks for X axis, filter out weeks beyond currentWeek/currentYear
  // Support both 'WW-YYYY' and 'YYYY-WW' formats
  function parseWeekYear(str: string) {
    const [a, b] = str.split('-');
    if (a.length === 4) return { year: +a, week: +b };
    return { week: +a, year: +b };
  }
  const allWeeks = Array.from(new Set(
    Object.values(pathwayWeeklyData).flat().map(d => d.week)
  ))
    .map(parseWeekYear)
    .filter(({ week, year }) =>
      year < currentYear || (year === currentYear && week <= currentWeek)
    )
    .sort((a, b) => a.year - b.year || a.week - b.week)
    .map(({ week, year }) => `${week}-${year}`);
  // Build chart data: [{ week, [visiteret-<pathwayId>], [disponeret-<pathwayId>] }]
  const chartData = allWeeks.map(week => {
    const entry: Record<string, any> = { week };
    Object.entries(pathwayWeeklyData).forEach(([pathwayId, dataArr]) => {
      const found = dataArr.find(d => d.week === week);
      entry[`visiteret-${pathwayId}`] = found ? found.visiteret : null;
      entry[`disponeret-${pathwayId}`] = found ? found.disponeret : null;
    });
    return entry;
  });

  console.log('Chart Data:', chartData);

  // Get pathway names for legend
  const pathwayNames: Record<string, string> = {};
  data?.pathways.forEach(p => { pathwayNames[p.id] = p.name; });

  return <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5
      }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" />
        <YAxis />
        <Tooltip />
        <Legend />
        {Object.keys(pathwayWeeklyData).map(pathwayId => (
          <React.Fragment key={pathwayId}>
            <Line
              type="monotone"
              dataKey={`visiteret-${pathwayId}`}
              stroke="#1d3557"
              name={`Visiteret (${pathwayNames[Number(pathwayId)]})`}
              activeDot={{ r: 8 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey={`disponeret-${pathwayId}`}
              stroke="#e63946"
              name={`Disponeret (${pathwayNames[Number(pathwayId)]})`}
              connectNulls
            />
          </React.Fragment>
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>;
};