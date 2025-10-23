import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockData } from '../data/mockData';
interface ServiceGraphProps {
  citizenId: number | null;
  showAlert?: boolean;
}
export const ServiceGraph: React.FC<ServiceGraphProps> = ({
  citizenId,
}) => {
  // Find the selected citizen or use the first one as default
  const citizen = citizenId ? mockData.citizens.find(c => c.id === citizenId) : mockData.citizens[0];
  // If no citizen is found, show a placeholder
  if (!citizen) {
    return <div className="h-64 flex items-center justify-center text-gray-500">
        Vælg en borger for at se grafen
      </div>;
  }
  // Modify the data for Borger 3 when alerts are hidden
  
  const weeklyData = citizen.weeklyData;
  return <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={weeklyData} margin={{
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
          <Line type="monotone" dataKey="visiteret" stroke="#1d3557" activeDot={{
          r: 8
        }} name="Visiteret" />
          <Line type="monotone" dataKey="disponeret" stroke="#e63946" name="Disponeret" />
        </LineChart>
      </ResponsiveContainer>
    </div>;
};