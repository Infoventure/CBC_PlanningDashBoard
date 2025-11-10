import React, { useState, Fragment, useContext } from 'react';
import fuzzysort from 'fuzzysort';
import { CitizenRow } from './CitizenRow';
import { RefreshCwIcon, SearchXIcon } from 'lucide-react';
import { DataContext } from '../App'; // adjust path as needed

interface CitizenTableProps {
  onSelectCitizen: (id: string | null) => void;
  selectedCitizen: string | null;
  teamId: number;
  currentWeek: number;
  currentYear: number;
}
export const CitizenTable: React.FC<CitizenTableProps> = ({
  onSelectCitizen,
  selectedCitizen,
  teamId,
  currentWeek,
  currentYear
}) => {

  const data = useContext(DataContext); // Removed unused DataContext reference

  const [expandedCitizen, setExpandedCitizen] = useState<string | null>(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>(data?.pathways[0]?.id || "Forløb 1");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRotating, setIsRotating] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]); // For 'Farve' filter
  const handleCitizenClick = (citizenId: string) => {
    if (expandedCitizen === citizenId) {
      setExpandedCitizen(null);
    } else {
      setExpandedCitizen(citizenId);
    }
    onSelectCitizen(citizenId);
  };

  // last 3 weeks + current
  const weeks = Array.from({ length: 4 }, (_, i) => `${currentWeek - 3 + i}-${currentYear}`);

  // Filter citizens by team ID, pathway, search term, and color (Farve)
  const filteredCitizens = data?.citizens
    .filter(citizen =>
      citizen.teamId === teamId &&
      citizen.pathwayData && citizen.pathwayData[selectedPathwayId]
    )
    .filter(citizen => {
      if (!searchTerm.trim()) return true;
      const nameResult = fuzzysort.single(searchTerm, citizen.name);
      const cprResult = fuzzysort.single(searchTerm.trim().replace('-', ''), citizen.cpr);
      return nameResult !== null || cprResult !== null;
    })
    .filter(citizen => {
      if (!selectedColors.length) return true;
      // Check if any of the weeks for this citizen in the selected pathway matches a selected color
      const pathwayWeeks = citizen.pathwayData[selectedPathwayId];
      return weeks.some(weekKey => {
        const weekData = pathwayWeeks ? pathwayWeeks[weekKey] : undefined;
        if (weekData && typeof weekData === 'object' && 'status' in weekData && typeof weekData.status === 'string') {
          // Normalize status to match filter (capitalize first letter)
          const normalizedStatus = weekData.status.charAt(0).toUpperCase() + weekData.status.slice(1).toLowerCase();
          return selectedColors.includes(normalizedStatus);
        }
        return false;
      });
    });
  const selectedPathway = data?.pathways.find(p => p.id === selectedPathwayId);

  const [selectedWeek, setSelectedWeek] = useState(weeks[3]); // default to current week

  if (!data) {
    return <div>Loading data...</div>;
  }

  return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#1d3557]">Borgeroversigt</h2>
          <div className="flex items-center gap-2">
            {/* Farve (Color) Multi-select Filter */}
            <div className='flex align-middle justify-center' title='Klik på en farve for kun at vise borgere som har denne farve i en af sine seneste 4 uger. - Vælg flere for at vise borgere som enten har "farve et" eller "farve to"'>
              <label className="text-sm font-medium text-[#1d3557] mr-2 flex items-center justify-center">Status farve:</label>
              <div className="flex mr-2 flex-col">
                {['Green', 'Yellow', 'Red'].map(color => {
                  let label = color;
                  if (color === 'Green') label = 'Grøn';
                  else if (color === 'Yellow') label = 'Gul';
                  else if (color === 'Red') label = 'Rød';
                  return (
                    <label key={color} className="flex items-center gap-1 text-xs font-medium cursor-pointer" style={{ color: color === 'Green' ? '#2ecc40' : color === 'Yellow' ? '#f1c40f' : '#e74c3c' }}>
                      <input
                        type="checkbox"
                        value={color}
                        checked={selectedColors.includes(color)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedColors(prev => [...prev, color]);
                          } else {
                            setSelectedColors(prev => prev.filter(c => c !== color));
                          }
                        }}
                        className="accent-current"
                      />
                      {label}
                    </label>
                  );
                })}
              </div>
            </div>
            <label className="text-sm font-medium text-[#1d3557] mr-2">Uge:</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm mr-2"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            >
              {weeks.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <label className="text-sm font-medium text-[#1d3557]">Forløb:</label>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={selectedPathwayId}
              onChange={e => setSelectedPathwayId(e.target.value)}
            >
              {data.pathways.map(pathway => (
                <option key={pathway.id} value={pathway.id}>{pathway.name}</option>
              ))}
            </select>
            <div className="flex items-center relative">
              <input
                type="text"
                className="border border-gray-300 rounded px-2 ml-4 py-1 text-sm"
                placeholder="Søg navn eller CPR"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ minWidth: "160px" }}
              />
              <button
                type="button"
                className="p-1 rounded-md hover:bg-red-600/10 text-[#1d3557] transition-colors absolute right-1"
                title="Ryd søgning"
                onClick={() => setSearchTerm("")}
              >
                <SearchXIcon className="h-4 w-4" />
              </button>
            </div>
              <button
                className="p-2 rounded-md hover:bg-gray-100 text-[#1d3557] transition-colors"
                title="Opdater tabeldata"
                onClick={() => {
                  setIsRotating(true);
                  setTimeout(() => setIsRotating(false), 600); // 600ms for 1 rotation
                }}
              >
                <RefreshCwIcon className={`h-4 w-4 ${isRotating ? 'animate-spin-once' : ''}`} />
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
                    className="inline-flex items-center gap-2 px-3 py-1 border border-gray-300 rounded text-sm text-[#1d3557] hover:bg-red-600/10 transition-colors"
                    onClick={() => setSearchTerm("")}
                    title="Nulstil søgning"
                  >
                    <SearchXIcon className="w-4 h-4" />
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
                  <>
                    <th scope="col" colSpan={6} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-300">
                      {selectedPathway.name} - <span className='ml-2 text-xs lowercase'>(minutter)</span>
                    </th>
                  </>
                )}
              </tr>
              <tr>
                <th className="border-r border-gray-300"></th>
                {selectedPathway && (
                  <>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Forløbets maksimale tid i minutter">
                      Forløb
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Visiteret tid i minutter">
                      Visiteret
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Disponeret tid i minutter">
                      Disponeret
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-200" title="Balance (Hvor mange flere timer er disponeret end visiteret)">
                      Balance
                    </th>
                    <th className="px-2 py-2 text-xs text-center border-r border-gray-300" title="Afstand til næste forløb i minutter">
                      Forløbsmargen
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCitizens.map(citizen => (
                <CitizenRow
                  key={citizen.id}
                  citizen={citizen}
                  week={selectedWeek}
                  expanded={expandedCitizen === citizen.id}
                  onClick={() => handleCitizenClick(citizen.id)}
                  isSelected={selectedCitizen === citizen.id}
                  pathwayId={selectedPathwayId}
                  pathwayMaxTime={selectedPathway?.maxTime}
                  pathwayMedTime={selectedPathway?.mediantime ?? null}
                  allPathways={data.pathways}
                />
              ))}
            </tbody>
          </table>
          )}
        </div>
          <style>{`
            @keyframes spin-once {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            .animate-spin-once {
              animation: spin-once 0.6s linear;
            }
            /* Custom accent color for checkboxes (for color filter) */
            input[type="checkbox"].accent-current:checked {
              accent-color: currentColor;
            }
          `}</style>
      </div>
    );
};