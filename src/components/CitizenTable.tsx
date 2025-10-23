import React, { useState, Fragment } from 'react';
import { mockData } from '../data/mockData';
import { CitizenRow } from './CitizenRow';
import { RefreshCwIcon, RotateCcwIcon } from 'lucide-react';
interface CitizenTableProps {
  onSelectCitizen: (id: number | null) => void;
  selectedCitizen: number | null;
  teamId: number;
}
export const CitizenTable: React.FC<CitizenTableProps> = ({
  onSelectCitizen,
  selectedCitizen,
  teamId,
}) => {
  const [expandedCitizen, setExpandedCitizen] = useState<number | null>(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState<number>(mockData.pathways[0]?.id || 1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const handleCitizenClick = (citizenId: number) => {
    if (expandedCitizen === citizenId) {
      setExpandedCitizen(null);
    } else {
      setExpandedCitizen(citizenId);
    }
    onSelectCitizen(citizenId);
  };

  // Filter citizens by team ID, pathway, and search term
  const filteredCitizens = mockData.citizens
    .filter(citizen =>
      citizen.teamId === teamId &&
      citizen.pathways.some(p => p.id === selectedPathwayId)
    )
    .filter(citizen => {
      if (!searchTerm.trim()) return true;
      return (
        citizen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citizen.cpr.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  const selectedPathway = mockData.pathways.find(p => p.id === selectedPathwayId);

    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#1d3557]">Borgeroversigt</h2>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-[#1d3557]">Forløb:</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={selectedPathwayId}
              onChange={e => setSelectedPathwayId(Number(e.target.value))}
            >
              {mockData.pathways.map(pathway => (
                <option key={pathway.id} value={pathway.id}>{pathway.name}</option>
              ))}
            </select>
            <input
              type="text"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              placeholder="Søg navn eller CPR"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ minWidth: "160px" }}
            />
            <button className="p-2 rounded-md hover:bg-gray-100 text-[#1d3557] transition-colors" title="Opdater tabeldata">
              <RefreshCwIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="w-full">
          {filteredCitizens.length === 0 ? (
            <div className="p-4 py-8 text-center text-gray-500 flex flex-col items-center gap-4">
              
              {!searchTerm ? (
                <div>Ingen borgere fundet</div> 
                ): (
                <>
                  <span>Ingen borgere matcher søgningen.</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1 border border-gray-300 rounded text-sm text-[#1d3557] hover:bg-gray-100 transition-colors"
                    onClick={() => setSearchTerm("")}
                    title="Nulstil søgning"
                  >
                    <RotateCcwIcon className="w-4 h-4" />
                    Nulstil søgning
                  </button>
                </>
              )}
              
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300 w-1/5">
                  Navn
                </th>
                {selectedPathway && (
                  <Fragment>
                    <th scope="col" colSpan={6} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                      {selectedPathway.name}
                    </th>
                  </Fragment>
                )}
              </tr>
              <tr>
                <th className="border-r border-gray-300"></th>
                {selectedPathway && (
                  <Fragment>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Forløbets median tid">
                      Forl
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Visiteret tid">
                      Vis
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Disponeret tid">
                      Disp
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Balance (Forskel mellem visiteret- og den disponerede tid)">
                      Bal Vis
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Balance (Forskel mellem forløbets median og den disponerede tid)">
                      Bal Forl
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-300" title="Balance beregnet som procent">
                      %
                    </th>
                  </Fragment>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCitizens.map(citizen => (
                <CitizenRow
                  key={citizen.id}
                  citizen={citizen}
                  expanded={expandedCitizen === citizen.id}
                  onClick={() => handleCitizenClick(citizen.id)}
                  isSelected={selectedCitizen === citizen.id}
                  pathwayId={selectedPathwayId}
                  pathwayTime={selectedPathway?.mediantime}
                />
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    );
};