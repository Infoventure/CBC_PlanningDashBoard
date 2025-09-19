import React, { useState } from 'react';
import { teamData } from '../data/teamData';
interface DetailedDataTableProps {
  teamId: number;
}
export const DetailedDataTable: React.FC<DetailedDataTableProps> = ({
  teamId
}) => {
  const [activeTab, setActiveTab] = useState<string>('citizens');
  const team = teamData.find(t => t.id === teamId) || teamData[0];
  const tabs = [{
    id: 'citizens',
    name: 'Borgere'
  }, {
    id: 'time',
    name: 'Tid'
  }, {
    id: 'economy',
    name: 'Økonomi'
  }];
  return <div className="bg-cbc-ps-grey rounded-lg border border-gray-200 shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-4 px-6 text-sm font-medium ${activeTab === tab.id ? 'border-b-2 border-cbc-dark-blue text-cbc-dark-blue' : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.name}
            </button>)}
        </nav>
      </div>
      <div className="p-4 overflow-x-auto">
        {activeTab === 'citizens' && <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cbc-beige bg-opacity-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forløb
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Antal borgere
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Andel af borgere
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gennemsnitlig vurdering
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unikke medarbejdere pr. borger
                </th>
              </tr>
            </thead>
            <tbody className="bg-cbc-ps-grey divide-y divide-gray-200">
              {team.pathways.map(pathway => <tr key={pathway.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      Forløb {pathway.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.citizenCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.citizenPercentage}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.averageAssessment.toFixed(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.uniqueEmployeesPerCitizen.toFixed(1)}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>}
        {activeTab === 'time' && <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cbc-beige bg-opacity-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forløb
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visiteret tid (timer)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planlagt tid (timer)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Planlægningsprocent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SSH/SSA tid
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SPL tid
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terapeut tid
                </th>
              </tr>
            </thead>
            <tbody className="bg-cbc-ps-grey divide-y divide-gray-200">
              {team.pathways.map(pathway => <tr key={pathway.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      Forløb {pathway.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.visitedTime.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedTime.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.planningPercentage}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedTimeSSH_SSA.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedTimeSPL.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedTimeTherapist.toLocaleString()}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>}
        {activeTab === 'economy' && <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-cbc-beige bg-opacity-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Forløb
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SSH/SSA økonomi (kr)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SPL økonomi (kr)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Terapeut økonomi (kr)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total økonomi (kr)
                </th>
              </tr>
            </thead>
            <tbody className="bg-cbc-ps-grey divide-y divide-gray-200">
              {team.pathways.map(pathway => <tr key={pathway.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      Forløb {pathway.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedEconomySSH_SSA.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedEconomySPL.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {pathway.plannedEconomyTherapist.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {(pathway.plannedEconomySSH_SSA + pathway.plannedEconomySPL + pathway.plannedEconomyTherapist).toLocaleString()}
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    </div>;
};