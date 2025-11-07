import React, { Fragment } from 'react';
import { Citizen, Pathway } from '../data/mockData';
import { ChevronDownIcon, ChevronRightIcon, UserIcon, ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { CopyIcon } from 'lucide-react';
interface CitizenRowProps {
  citizen: Citizen;
  week: string;
  expanded: boolean;
  onClick: () => void;
  isSelected: boolean;
  pathwayId: string;
  pathwayTime?: number;
  allPathways?: Pathway[];
}
export const CitizenRow: React.FC<CitizenRowProps> = ({
  citizen,
  week,
  expanded,
  onClick,
  isSelected,
  pathwayId,
  pathwayTime,
  allPathways,
}) => {
  const handleCopyCpr = (cpr: string) => {
    navigator.clipboard.writeText(cpr);
  };
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'bg-red-100';
    return 'bg-green-100';
  };
  const getPercentageColor = (percentage: number) => {
    if (percentage > 75) return 'bg-red-100 text-red-700';
    if (percentage > 50) return 'bg-yellow-100 text-yellow-700';
    if (percentage < 20) return 'bg-green-100 text-green-700';
    return 'bg-yellow-50 text-yellow-600';
  };

  const pathways = citizen.pathwayData;
  const procedures = citizen.pathwayData[pathwayId][week]?.procedures;
  const pathway = pathways[pathwayId][week]?.total;

  // Compute balance dynamically
  const balance = pathway?.disponeret - pathway?.visiteret;

  const pathwayMargin = (() => {
    if (!pathway || !allPathways) return '-';
    const pathwayDef = allPathways.find(p => p.id === pathwayId);
    if (!pathwayDef) return '-';
    const minTime = pathwayDef.minTime;
    const maxTime = pathwayDef.maxTime;

    const toMin = pathway.disponeret - minTime;
    const toMax = maxTime ? maxTime - pathway.disponeret : undefined;
    
    // Helper to get color classes based on value
    const getColor = (val: number | undefined) => {
      if (val !== undefined && val <= 0) return { bg: 'bg-red-100', text: 'text-red-700' };
      if (val !== undefined && val <= 30) return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
      return { bg: 'bg-green-100', text: 'text-green-700' };
    };
    const minColor = getColor(toMin);
    const maxColor = getColor(toMax);

    let minColorTitle = '';
    let maxColorTitle = '';

    if (toMin < 0) {
      minColorTitle = 'Borgeren har fået disponeret mindre tid end forløbets minimum. Enten mangler de planlagte ydelser, ellers skal de flyttes til lavere et forløb';
    }
    if (toMax !== undefined && toMax < 0) {
      maxColorTitle = 'Borgeren har fået disponeret mere tid end forløbets maksimum. Dette kan medføre økonomiske tab for kommunen. Enten har de fået disponeret for meget, ellers skal de flyttes til et højere forløb';
    }

    return (
      <div className='flex justify-center items-center'>
        <span className={`ml-2 px-2 inline-flex items-center text-sm leading-5 font-semibold rounded-full ${minColor.bg} ${minColor.text}`} title={minColorTitle || undefined}> 
          <ArrowLeftIcon className={`h-4 w-4 mr-1 ${minColor.text}`} />
          {toMin}
        </span>
        <span className={`ml-2 px-2 inline-flex items-center text-sm leading-5 font-semibold rounded-full ${maxColor.bg} ${maxColor.text}`} title={maxColorTitle || undefined}>
          {toMax}
          <ArrowRightIcon className={`h-4 w-4 ml-1 ${maxColor.text}`} />
        </span>
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
                  {citizen.cpr}
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
              {<span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">0 uger</span>}
            </div>
          </div>
        </td>
        {pathway ? (
          <>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathwayTime || '-'}</td>
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
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathwayTime || '-'}</td>
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