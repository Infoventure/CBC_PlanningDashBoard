import React from 'react';
import { teamData } from '../data/teamData';
interface TeamSummaryProps {
  teamId: number;
}
export const TeamSummary: React.FC<TeamSummaryProps> = ({
  teamId
}) => {
  const team = teamData.find(t => t.id === teamId) || teamData[0];
  // Calculate total citizens, visited time, and planned time across all pathways
  const totalCitizens = team.pathways.reduce((sum, pathway) => sum + pathway.citizenCount, 0);
  const totalVisitedTime = team.pathways.reduce((sum, pathway) => sum + pathway.visitedTime, 0);
  const totalPlannedTime = team.pathways.reduce((sum, pathway) => sum + pathway.plannedTime, 0);
  const averagePlanningPercentage = Math.round(totalPlannedTime / totalVisitedTime * 100);
  const getPlanningPercentageColor = (percentage: number) => {
    if (percentage > 110) return 'text-red-600';
    if (percentage > 100) return 'text-yellow-600';
    if (percentage < 90) return 'text-red-600';
    return 'text-green-600';
  };
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#1d3557]">
          {team.name} - Nøgletal
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Antal borgere
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {totalCitizens}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Visiteret tid (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {totalVisitedTime.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Planlagt tid (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {totalPlannedTime.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Planlægningsprocent
          </h3>
          <p className={`text-2xl font-semibold ${getPlanningPercentageColor(averagePlanningPercentage)}`}>
            {averagePlanningPercentage}%
          </p>
        </div>
      </div>
      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <h3 className="text-sm font-medium text-gray-500 mb-3">
          Fordeling af borgere efter forløb
        </h3>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div className="flex">
              <span className="inline-block w-3 h-3 mr-1 bg-[#1d3557] rounded-sm"></span>
              <span className="text-xs font-semibold text-gray-700">
                Forløb 1: {team.pathways[0].citizenCount} borgere (
                {team.pathways[0].citizenPercentage}%)
              </span>
            </div>
            <div className="flex">
              <span className="inline-block w-3 h-3 mr-1 bg-[#457b9d] rounded-sm"></span>
              <span className="text-xs font-semibold text-gray-700">
                Forløb 2: {team.pathways[1].citizenCount} borgere (
                {team.pathways[1].citizenPercentage}%)
              </span>
            </div>
            <div className="flex">
              <span className="inline-block w-3 h-3 mr-1 bg-[#a8dadc] rounded-sm"></span>
              <span className="text-xs font-semibold text-gray-700">
                Forløb 3: {team.pathways[2].citizenCount} borgere (
                {team.pathways[2].citizenPercentage}%)
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
            <div style={{
            width: `${team.pathways[0].citizenPercentage}%`
          }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#1d3557]"></div>
            <div style={{
            width: `${team.pathways[1].citizenPercentage}%`
          }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#457b9d]"></div>
            <div style={{
            width: `${team.pathways[2].citizenPercentage}%`
          }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#a8dadc]"></div>
          </div>
        </div>
      </div>
    </div>;
};