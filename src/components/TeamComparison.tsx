import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { teamData } from '../data/teamData';
interface ComparisonData {
  name: string;
  [key: string]: string | number;
}
export const TeamComparison: React.FC = () => {
  const [metric, setMetric] = useState<string>('citizenCount');
  const [pathway, setPathway] = useState<number>(0); // 0 means all pathways
  const metrics = [{
    id: 'citizenCount',
    name: 'Antal borgere'
  }, {
    id: 'visitedTime',
    name: 'Visiteret tid'
  }, {
    id: 'plannedTime',
    name: 'Planlagt tid'
  }, {
    id: 'planningPercentage',
    name: 'Planlægningsprocent'
  }, {
    id: 'uniqueEmployeesPerCitizen',
    name: 'Unikke medarbejdere pr. borger'
  }];
  const pathwayOptions = [{
    id: 0,
    name: 'Alle forløb'
  }, {
    id: 1,
    name: 'Forløb 1'
  }, {
    id: 2,
    name: 'Forløb 2'
  }, {
    id: 3,
    name: 'Forløb 3'
  }];
  const prepareComparisonData = (): ComparisonData[] => {
    return teamData.slice(0, 4).map(team => {
      if (pathway === 0) {
        // Calculate total or average across all pathways
        const totalCitizens = team.pathways.reduce((sum, p) => sum + p.citizenCount, 0);
        const totalVisitedTime = team.pathways.reduce((sum, p) => sum + p.visitedTime, 0);
        const totalPlannedTime = team.pathways.reduce((sum, p) => sum + p.plannedTime, 0);
        const avgPlanningPercentage = Math.round(totalPlannedTime / totalVisitedTime * 100) || 0;
        const avgUniqueEmployees = team.pathways.reduce((sum, p) => sum + p.uniqueEmployeesPerCitizen, 0) / team.pathways.length;
        return {
          name: team.name,
          citizenCount: totalCitizens,
          visitedTime: totalVisitedTime,
          plannedTime: totalPlannedTime,
          planningPercentage: avgPlanningPercentage,
          uniqueEmployeesPerCitizen: Number(avgUniqueEmployees.toFixed(1))
        };
      } else {
        // Get data for specific pathway
        const pathwayData = team.pathways.find(p => p.id === pathway);
        if (!pathwayData) return {
          name: team.name
        };
        return {
          name: team.name,
          citizenCount: pathwayData.citizenCount,
          visitedTime: pathwayData.visitedTime,
          plannedTime: pathwayData.plannedTime,
          planningPercentage: pathwayData.planningPercentage,
          uniqueEmployeesPerCitizen: pathwayData.uniqueEmployeesPerCitizen
        };
      }
    });
  };
  const data = prepareComparisonData();
  const getYAxisDomain = () => {
    if (metric === 'planningPercentage') {
      return [80, 140];
    }
    if (metric === 'uniqueEmployeesPerCitizen') {
      return [0, 12];
    }
    return [0, 'auto'];
  };
  const formatYAxis = (value: number) => {
    if (metric === 'planningPercentage') {
      return `${value}%`;
    }
    if (metric === 'visitedTime' || metric === 'plannedTime' || metric === 'citizenCount') {
      return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
    }
    return value;
  };
  return <div className="bg-cbc-ps-grey rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-cbc-dark-blue mb-4">
          Team sammenligning
        </h2>
        <div className="flex flex-wrap gap-4">
          <div>
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
              Metrik
            </label>
            <select id="metric" value={metric} onChange={e => setMetric(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cbc-dark-blue focus:ring-cbc-dark-blue sm:text-sm">
              {metrics.map(m => <option key={m.id} value={m.id}>
                  {m.name}
                </option>)}
            </select>
          </div>
          <div>
            <label htmlFor="pathway" className="block text-sm font-medium text-gray-700 mb-1">
              Forløb
            </label>
            <select id="pathway" value={pathway} onChange={e => setPathway(parseInt(e.target.value))} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-cbc-dark-blue focus:ring-cbc-dark-blue sm:text-sm">
              {pathwayOptions.map(p => <option key={p.id} value={p.id}>
                  {p.name}
                </option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={getYAxisDomain()} tickFormatter={formatYAxis} />
              <Tooltip formatter={value => metric === 'planningPercentage' ? `${value}%` : value.toLocaleString()} />
              <Bar dataKey={metric} name={metrics.find(m => m.id === metric)?.name || 'Værdi'} fill="#0070AA" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>;
};