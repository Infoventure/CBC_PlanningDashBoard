import React, { useContext } from 'react';
import { DataContext } from '../App';
interface TeamSummaryCardProps {
  teamId: number;
}
export const TeamSummaryCard: React.FC<TeamSummaryCardProps> = ({
  teamId
}) => {
  const data = useContext(DataContext);
  
  // Filter citizens by team ID
  const teamCitizens = data?.citizens.filter(citizen => citizen.teamId === teamId);

  const pathwaysMedianTimes = data?.pathways.reduce((acc, pathway) => { // object of { [pathwayId]: mediantime }
    acc[Number(pathway.id)] = pathway.mediantime;
    return acc;
  }, {} as { [key: number]: number });

  // Calculate totals from filtered citizens
  const totals = teamCitizens?.reduce((acc, citizen) => {
    Object.entries(citizen.pathwayData).forEach(([pathwayId, weeks]) => {
      Object.entries(weeks).forEach(([week, data]) => {
        acc.totalPathwayMedians += pathwaysMedianTimes[Number(pathwayId)] || 0;
        acc.visiteret += data.total.visiteret;
        acc.disponeret += data.total.disponeret;
      });
    });
    acc.balance = acc.disponeret - acc.totalPathwayMedians
    return acc;
  }, {
    totalPathwayMedians: 0,
    visiteret: 0,
    disponeret: 0,
    balance: 0
  });
  // Calculate percentage of disponeret to visiteret
  const andelDisponeret = totals?.visiteret > 0 ? Math.round(totals?.disponeret / totals?.visiteret * 100) : 0;
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-red-600';
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
            {Math.floor(totals?.totalPathwayMedians / 60).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Visiteret (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {Math.floor(totals?.visiteret / 60).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Disponeret (timer)
          </h3>
          <p className="text-2xl font-semibold text-[#1d3557]">
            {Math.floor(totals?.disponeret / 60).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg" title='Hvor mange flere timer er disponeret end den samlede forløbstid'>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Afvigelse</h3>
          <p className={`text-2xl font-semibold ${getBalanceColor(totals?.balance)}`}>
            {Math.floor(totals?.balance / 60).toLocaleString()}
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