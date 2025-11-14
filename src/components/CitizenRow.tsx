import React from 'react';
import { Citizen, Pathway, Procedure } from '../data/mockData';
import { ChevronDownIcon, ChevronRightIcon, UserIcon } from 'lucide-react';
import { CopyIcon } from 'lucide-react';
interface CitizenRowProps {
  citizen: Citizen;
  chosenWeeks: string[];
  expanded: boolean;
  onClick: () => void;
  isSelected: boolean;
  chosenPathwayId: string;
  chosenPathwayMaxTime?: number | null;
  chosenPathwayMedTime?: number | null;
  allPathways?: Pathway[];
}
export const CitizenRow: React.FC<CitizenRowProps> = ({
  citizen,
  chosenWeeks,
  expanded,
  onClick,
  isSelected,
  chosenPathwayId,
  chosenPathwayMaxTime,
  chosenPathwayMedTime,
  allPathways,
}) => {
  const handleCopyCpr = (cpr: string) => {
    navigator.clipboard.writeText(cpr);
  };

  const processedChosenPathwayMaxTime = chosenPathwayMaxTime ? chosenPathwayMaxTime * chosenWeeks.length : null;
  const processedChosenPathwayMedTime = chosenPathwayMedTime ? chosenPathwayMedTime * chosenWeeks.length : null;

  const pathways = citizen.pathwayData;
  // Aggregate procedures across all chosenWeeks, grouped by name (one-liner)
  const procedures = Object.values(
    chosenWeeks
      .flatMap((week: string) => Object.values(citizen.pathwayData[chosenPathwayId]?.[week]?.procedures || {}))
      .reduce(
        (groupedProcedures: Record<string, Procedure>, procedure: Procedure) => {
          groupedProcedures[procedure.name] = groupedProcedures[procedure.name]
            ? {
                ...groupedProcedures[procedure.name],
                visiteret: groupedProcedures[procedure.name].visiteret + (procedure.visiteret || 0),
                disponeret: groupedProcedures[procedure.name].disponeret + (procedure.disponeret || 0),
              }
            : { ...procedure, visiteret: procedure.visiteret || 0, disponeret: procedure.disponeret || 0 };
          return groupedProcedures;
        },
        {} as Record<string, Procedure>
      )
  );
  // Gather all weeks' statuses for the given pathwayId, including the week key, sorted by week-year
  const statusies = Object.entries(citizen.pathwayData[chosenPathwayId] || {})
    .sort(([a], [b]) => {
      // a and b are week keys in the format 'weekNumber-Year'
      const [aWeek, aYear] = a.split('-').map(Number);
      const [bWeek, bYear] = b.split('-').map(Number);
      if (aYear !== bYear) return aYear - bYear;
      return aWeek - bWeek;
    })
    .map(([week, weekData]: [string, any]) => ({
      week,
      status: weekData?.status
    }));
  // Sum visiteret and disponeret for all 'total's of all chosenWeeks
  const pathway = chosenWeeks
    .map((week: string) => pathways[chosenPathwayId]?.[week]?.total)
    .reduce(
      (sum: { visiteret: number; disponeret: number }, total: any) => ({
        visiteret: sum?.visiteret + (total?.visiteret || 0),
        disponeret: sum?.disponeret + (total?.disponeret || 0),
      }),
      { visiteret: 0, disponeret: 0 }
    );

  // Compute balance dynamically
  const balance = pathway?.disponeret - pathway?.visiteret;

  const lastPathwayDefaultMax = 10000 // Default max time for the last pathway if undefined
  const pathwayMargin = (() => {
    if (!pathway || !allPathways) return '-';

    const sorted = [...allPathways].sort((a, b) => a.minTime - b.minTime);
    const totalCount = sorted.length;

    // Helper to normalize within a specific pathway
    const getRelativePosition = (p: Pathway, val: number) =>
      ((val - p.minTime) / ((p.maxTime || lastPathwayDefaultMax) - p.minTime)) * 100;

    // Find which pathway the disponeret belongs to
    const activePathwayIndex = sorted.findIndex(
      p => pathway.disponeret >= p.minTime && pathway.disponeret <= (p.maxTime || lastPathwayDefaultMax)
    );

    // Compute position within that segment
    const activePathway = sorted[activePathwayIndex];
    const relativePos =
      activePathwayIndex === -1
        ? 0
        : getRelativePosition(activePathway, pathway.disponeret);

    // Compute final left position as % across all segments
    const leftPos =
      activePathwayIndex === -1
        ? 0
        : activePathwayIndex * (100 / totalCount) + (relativePos / totalCount);

    // Find selected pathway index by pathwayId
    const selectedPathwayIndex = sorted.findIndex(p => p.id === chosenPathwayId);
    const selectedPathway =
      selectedPathwayIndex !== -1 ? sorted[selectedPathwayIndex] : null;

    // Determine marker color
    let markerColor = 'bg-red-500/70'; // default outside
    if (selectedPathway) {
      const min = selectedPathway.minTime;
      const max = selectedPathway.maxTime || lastPathwayDefaultMax;
      const range = max - min;
      const twentyPercent = 0.2 * range;

      if (pathway.disponeret >= min && pathway.disponeret <= max) {
        // Inside bounds
        if (
          pathway.disponeret <= min + twentyPercent ||
          pathway.disponeret >= max - twentyPercent
        ) {
          markerColor = 'bg-yellow-500/70'; // warning zone
        } else {
          markerColor = 'bg-green-500/70'; // safe zone
        }
      }
    }

    // Create "Pathway margin" visualization
    return (
      <div className="w-full flex flex-col items-center relative px-1 my-1">
        {/* Time labels above the line */}
        <div className="absolute top-0 left-0 w-full flex justify-between text-xs text-gray-600">
          {sorted.map((p, i) => (
            i !== totalCount - 1 && (
              <div
                key={p.id}
                className="absolute transform -translate-x-1/2 text-center text-[11px] -top-1"
                style={{ left: `${((i + 1) / totalCount) * 100}%` }}
                title={"Forløb " + (i + 1) + " - max tid: " + p.maxTime?.toString()}
              >
                <div>{p.maxTime}</div>
              </div>
            )
          ))}
        </div>

        {/* The visual line */}
        <div className="relative w-full h-2 bg-gray-200 mt-4 rounded-full">
          {/* Highlight selected pathway */}
          {selectedPathwayIndex !== -1 && (
            <div
              className="absolute top-0 h-2 bg-green-300 rounded-full"
              style={{
                left: `${(selectedPathwayIndex / totalCount) * 100}%`,
                width: `${100 / totalCount}%`,
              }}
              title={`Expected range: ${
                sorted[selectedPathwayIndex].name || `Pathway ${selectedPathwayIndex + 1}`
              }`}
            />
          )}

          {/* Pathway segment edges */}
          {sorted.map((p, i) => (
            i !== totalCount - 1 && (
              <div
                key={p.id}
                className="absolute top-0 h-4 border-r-2 border-gray-500"
                style={{ left: `${((i + 1) / totalCount) * 100}%` }}
                title={"Forløb " + (i + 1) + " - max tid: " + p.maxTime?.toString()}
              />
            )
          ))}

          {/* Disponeret marker */}
          <div
            className={`absolute -top-1 w-4 h-4 rounded-full border-2 border-white shadow ${markerColor}`}
            style={{ left: `calc(${leftPos}% - 8px)` }}
            title={`Disponeret: ${pathway.disponeret}`}
          />
        </div>

        {/* Optional labels */}
        <div className="flex justify-between w-full text-xs text-gray-600 mt-1">
          {sorted.map((p, i) => (
            <span
              key={p.id}
              className='-mx-[1px]'
              style={{
                textAlign: 'center',
                width: `${100 / totalCount}%`,
              }}
            >
              {'Forl ' + (p.name?.split(' ')[1] || `${i + 1}`)}
            </span>
          ))}
        </div>
      </div>
    );
  })();


  return (
    <>
      <tr className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`} onClick={onClick}>
        <td className="px-4 py-1 whitespace-nowrap border-r border-gray-300">
          <div className="flex items-center">
            {expanded ? <ChevronDownIcon className="h-4 w-4 text-[#1d3557] mr-2" /> : <ChevronRightIcon className="h-4 w-4 text-[#1d3557] mr-2" />}
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 text-[#1d3557] mr-2" />
              <div className="flex flex-col">
                <span className="font-medium text-sm" title='Borger navn'>{citizen.name}</span>
                <span className="text-xs text-gray-400 flex items-center" title='CPR nummer'>
                  {citizen.cpr ? `${citizen.cpr.slice(0, -4)}-${citizen.cpr.slice(-4)}` : ''}
                  <button
                    type="button"
                    className="ml-1 p-0.5 hover:bg-gray-200 rounded"
                    title="Kopier CPR"
                    onClick={e => {
                      e.stopPropagation();
                      handleCopyCpr(citizen.cpr);
                    }}
                  >
                    <CopyIcon className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                  </button>
                </span>
              </div>
              <div className='ml-2 flex'>
              {statusies.slice(-4).map((week, index) => (
                <span
                  key={index}
                  className={`ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${week.status === 'green' ? 'bg-green-200 text-green-400' : week.status === 'yellow' ? 'bg-yellow-300 text-yellow-500' : week.status === 'red' ? 'bg-red-200 text-red-400' : 'bg-gray-200 text-gray-400'}`}
                  title={
                    week.status === 'green'
                      ? `Korrekt forløb i uge ${week.week}`
                      : week.status === 'yellow'
                        ? `Blandt de ydelige 20% for forløbet i uge ${week.week}`
                        : week.status === 'red'
                          ? `Udenfor forløbet i uge ${week.week}`
                          : `Ingen data for uge ${week.week}`
                  }
                >
                  -
                </span>
              ))}
              </div>
            </div>
          </div>
        </td>
        {pathway ? (
          <>
            <td className="relative px-2 py-3 text-sm text-center border-r border-gray-200">
              <div className="flex flex-col items-center">
                <span>{processedChosenPathwayMaxTime || '-'}</span>
                <span title='Forløbets gennemsnitstid' className="text-xs text-gray-400 flex items-center mt-0.5 absolute bottom-1">Gns. {processedChosenPathwayMedTime || '-'}</span>
              </div>
            </td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathway.visiteret || '-'}</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathway.disponeret || '-'}</td>
            <td className={`px-2 py-3 text-sm text-center border-r border-gray-200 ${balance > 0 ? 'text-red-500' : 'text-yellow-600'}`}> 
              {balance > 0 ? `+${balance}` : balance < 0 ? `${balance}` : balance === 0 ? '0' : '-'}
            </td>
            <td>
               {pathwayMargin}
            </td>
          </>
        ) : (
          <>
            <td className="relative px-2 py-3 text-sm text-center border-r border-gray-200">
              <div className="flex flex-col items-center">
                <span>{processedChosenPathwayMaxTime || '-'}</span>
                <span title='Forløbets gennemsnitstid' className="text-xs text-gray-400 flex items-center mt-0.5 absolute bottom-1">Gns. {processedChosenPathwayMedTime || '-'}</span>
              </div>
            </td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-300">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-300">-</td>
          </>
        )}
      </tr>
      {expanded && procedures && Object.values(procedures).map((procedure, serviceIndex) => (
        <tr key={`service-${serviceIndex}`} className="bg-gray-50">
          <td className="px-4 py-2 text-sm font-medium border-r border-gray-300">
            <div className="pl-6 border-l-2 border-[#1d3557]">{procedure.name}</div>
          </td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">-</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{procedure.visiteret}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{procedure.disponeret}</td>
          <td className={`px-2 py-2 text-sm text-center border-r border-gray-300 ${(procedure.disponeret- procedure.visiteret) > 0 ? 'text-red-500' : 'text-yellow-600'}`}>
            {(procedure.disponeret - procedure.visiteret) > 0
              ? `+${procedure.disponeret - procedure.visiteret}`
              : (procedure.disponeret - procedure.visiteret) < 0
                ? `${procedure.disponeret - procedure.visiteret}`
                : (procedure.disponeret - procedure.visiteret) === 0
                  ? '0'
                  : '-'}
          </td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">-</td>
        </tr>
      ))}
    </>
  );
};