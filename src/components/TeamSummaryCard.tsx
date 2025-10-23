import React from 'react';
import { mockData } from '../data/mockData';
interface TeamSummaryCardProps {
  teamId: number;
}
export const TeamSummaryCard: React.FC<TeamSummaryCardProps> = ({
  teamId
}) => {
  // Filter citizens by team ID
  const teamCitizens = mockData.citizens.filter(citizen => citizen.teamId === teamId);

  const pathwaysMedianTimes = mockData.pathways.reduce((acc, pathway) => { // object of { [pathwayId]: mediantime }
    acc[pathway.id] = pathway.mediantime;
    return acc;
  }, {} as { [key: number]: number });

  // Calculate totals from filtered citizens
  const totals = teamCitizens.reduce((acc, citizen) => {
    citizen.pathways.forEach(pathway => {
      acc.totalPathwayMedians += pathwaysMedianTimes[pathway.id] || 0;
      acc.visiteret += pathway.visiteret;
      acc.disponeret += pathway.disponeret;
      acc.balance += pathway.balance;
    });
    return acc;
  }, {
    totalPathwayMedians: 0,
    visiteret: 0,
    disponeret: 0,
    balance: 0
  });
  // Calculate percentage of disponeret to visiteret
  const andelDisponeret = totals.visiteret > 0 ? Math.round(totals.disponeret / totals.visiteret * 100) : 0;
  const getBalanceColor = (balance: number) => {
    if (balance < 0) return 'text-red-600';
    return 'text-green-600';
  };
  const getPercentageColor = (percentage: number) => {
    if (percentage > 120) return 'text-red-600';
    if (percentage > 100) return 'text-yellow-600';
    if (percentage < 90) return 'text-red-600';
    return 'text-green-600';
  };
  return <div className="bg-white rounded-lg shadow-lg mb-6">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#1d3557]">
          Team {teamId} - Oversigt
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total forløbstid (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {totals.totalPathwayMedians.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Visiteret (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {totals.visiteret.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Disponeret (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {totals.disponeret.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Afvigelse</h3>
          <p className={`text-2xl font-semibold ${getBalanceColor(totals.balance)}`}>
            {totals.balance.toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Andel disponeret
          </h3>
          <p className={`text-2xl font-semibold ${getPercentageColor(andelDisponeret)}`}>
            {andelDisponeret}%
          </p>
        </div>
      </div>
    </div>;
};