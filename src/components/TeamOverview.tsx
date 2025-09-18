import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { teamData, planningPercentageData } from '../data/managementData';
interface TeamOverviewProps {
  teamId: number;
}
export const TeamOverview: React.FC<TeamOverviewProps> = ({
  teamId
}) => {
  const team = teamData.find(t => t.id === teamId) || teamData[0];
  return <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Chart 1: Udvikling i antal visiterede borgere */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-center mb-4 text-[#1d3557]">
            Udvikling i antal visiterede borgere
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={team.citizenCountData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 600]} />
                <Tooltip />
                <Bar dataKey="value" fill="#1d3557" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Chart 2: Udvikling i visiteret og planlagt tid */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-center mb-4 text-[#1d3557]">
            Udvikling i visiteret og planlagt tid
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={team.visitedPlannedData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 160000]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="visiteret" name="Udvikling i visiteret tid" fill="#1d3557" />
                <Bar dataKey="planlagt" name="Udvikling i planlagt tid" fill="#a8dadc" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Chart 3: Planlægningsprocent */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-center mb-4 text-[#1d3557]">
          Planlægningsprocent
          <span className="block text-sm font-normal text-gray-500">
            (Planlagt tid / Visiteret tid)
          </span>
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={planningPercentageData} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[85, 145]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="team1" stroke="#1d3557" name="Team 1" strokeWidth={2} activeDot={{
              r: 8
            }} />
              <Line type="monotone" dataKey="team2" stroke="#e63946" name="Team 2" strokeWidth={2} />
              <Line type="monotone" dataKey="team3" stroke="#2a9d8f" name="Team 3" strokeWidth={2} />
              <Line type="monotone" dataKey="team4" stroke="#457b9d" name="Team 4" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>;
};