import React, { useState, Fragment } from 'react';
import { mockData } from '../data/mockData';
import { CitizenRow } from './CitizenRow';
import { RefreshCwIcon } from 'lucide-react';
interface CitizenTableProps {
  onSelectCitizen: (id: number | null) => void;
  selectedCitizen: number | null;
  teamId: number;
}
export const CitizenTable: React.FC<CitizenTableProps> = ({
  onSelectCitizen,
  selectedCitizen,
  teamId
}) => {
  const [expandedCitizen, setExpandedCitizen] = useState<number | null>(null);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const handleCitizenClick = (citizenId: number) => {
    if (expandedCitizen === citizenId) {
      setExpandedCitizen(null);
    } else {
      setExpandedCitizen(citizenId);
    }
    onSelectCitizen(citizenId);
  };
  // Filter citizens by team ID
  const filteredCitizens = mockData.citizens.filter(citizen => citizen.teamId === teamId);
  return <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-[#1d3557]">Borgeroversigt</h2>
        <button onClick={() => setShowAlerts(!showAlerts)} className="p-2 rounded-md hover:bg-gray-100 text-[#1d3557] transition-colors" title={showAlerts ? 'Skjul advarsler' : 'Vis advarsler'}>
          <RefreshCwIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="w-full">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 w-1/5">
                Navn
              </th>
              {mockData.pathways.map(pathway => <Fragment key={pathway.id}>
                  <th scope="col" colSpan={4} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                    {pathway.name}
                  </th>
                </Fragment>)}
            </tr>
            <tr>
              <th className="border-r border-gray-300"></th>
              {mockData.pathways.map((pathway, index) => <Fragment key={`header-${pathway.id}`}>
                  <th className="px-2 py-2 text-xs text-center border-r border-gray-200">
                    Vis
                  </th>
                  <th className="px-2 py-2 text-xs text-center border-r border-gray-200">
                    Disp
                  </th>
                  <th className="px-2 py-2 text-xs text-center border-r border-gray-200">
                    Bal
                  </th>
                  <th className={`px-2 py-2 text-xs text-center ${index < mockData.pathways.length - 1 ? 'border-r border-gray-300' : ''}`}>
                    %
                  </th>
                </Fragment>)}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCitizens.map(citizen => <CitizenRow key={citizen.id} citizen={citizen} expanded={expandedCitizen === citizen.id} onClick={() => handleCitizenClick(citizen.id)} isSelected={selectedCitizen === citizen.id} showAlert={showAlerts} />)}
          </tbody>
        </table>
      </div>
    </div>;
};