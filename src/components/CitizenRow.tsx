import React, { Fragment } from 'react';
import { Citizen } from '../data/mockData';
import { ChevronDownIcon, ChevronRightIcon, UserIcon } from 'lucide-react';
import { CopyIcon } from 'lucide-react';
interface CitizenRowProps {
  citizen: Citizen;
  expanded: boolean;
  onClick: () => void;
  isSelected: boolean;
  showAlert?: boolean;
  pathwayId: number;
  pathwayTime?: number;
}
export const CitizenRow: React.FC<CitizenRowProps> = ({
  citizen,
  expanded,
  onClick,
  isSelected,
  showAlert = true,
  pathwayId,
  pathwayTime
}) => {
  const handleCopyCpr = (cpr: string) => {
    navigator.clipboard.writeText(cpr);
  };
  const getBalanceColor = (balance: number) => {
    if (balance < 0) return 'bg-red-100';
    return 'bg-green-100';
  };
  const getPercentageColor = (percentage: number) => {
    if (percentage > 120) return 'bg-red-100 text-red-700';
    if (percentage > 100) return 'bg-yellow-100 text-yellow-700';
    if (percentage < 60) return 'bg-green-100 text-green-700';
    return 'bg-yellow-50 text-yellow-600';
  };
  // Modify the data for Borger 3 when alerts are hidden
  const getModifiedPathways = () => {
    if (citizen.id === 3 && !showAlert) {
      return citizen.pathways.map(pathway => ({
        ...pathway,
        disponeret: pathway.id === 1 ? 60 : pathway.disponeret,
        balance: pathway.id === 1 ? pathway.visiteret - 60 : pathway.balance,
        andelDisponeret: pathway.id === 1 ? Math.round(60 / pathway.visiteret * 100) : pathway.andelDisponeret
      }));
    }
    return citizen.pathways;
  };
  // Modify the services for Borger 3 when alerts are hidden
  const getModifiedServices = () => {
    if (citizen.id === 3 && !showAlert && citizen.services) {
      return citizen.services.map(service => {
        if (service.name === 'Personlig pleje') {
          return {
            ...service,
            hours: 20
          };
        } else if (service.name === 'Praktisk hjælp') {
          return {
            ...service,
            hours: 10
          };
        }
        return service;
      });
    }
    return citizen.services;
  };
  const pathways = getModifiedPathways();
  const services = getModifiedServices();
  const pathway = pathways.find(p => p.id === pathwayId);

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
              {citizen.alert && showAlert && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">4 uger</span>}
            </div>
          </div>
        </td>
        {pathway ? (
          <>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathwayTime || '-'}</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathway.visiteret || '-'}</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">{pathway.disponeret || '-'}</td>
            <td className={`px-2 py-3 text-sm text-center border-r border-gray-200 ${pathway.balance < 0 ? 'text-red-500' : ''}`}>
              {typeof pathway.balance === 'number' ? (pathway.balance > 0 ? `+${pathway.balance}` : pathway.balance) : '-'}
            </td>
            <td className={`px-2 py-3 text-sm text-center border-r border-gray-200 ${pathway.balancePathwayMedian < 0 ? 'text-red-500' : ''}`}>
              {typeof pathway.balancePathwayMedian === 'number' ? (pathway.balancePathwayMedian > 0 ? `+${pathway.balancePathwayMedian}` : pathway.balancePathwayMedian) : '-'}
            </td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-300">{pathway.visiteret > 0 ? <span className={`px-2 py-1 rounded-full text-xs ${getPercentageColor(pathway.andelDisponeret)}`}>{pathway.andelDisponeret}%</span> : '-'}</td>
          </>
        ) : (
          <>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-200">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-300">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-300">-</td>
            <td className="px-2 py-3 text-sm text-center border-r border-gray-300">-</td>
          </>
        )}
      </tr>
      {expanded && services && services.map((service, serviceIndex) => (
        <tr key={`service-${serviceIndex}`} className="bg-gray-50">
          <td className="px-4 py-2 text-sm font-medium border-r border-gray-300">
            <div className="pl-6 border-l-2 border-[#1d3557]">{service.name}</div>
          </td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Vis column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{service.hours}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Bal column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-300">{/* Empty % column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Vis column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Disp column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Bal column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-300">{/* Empty % column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Vis column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Disp column */}</td>
          <td className="px-2 py-2 text-sm text-center border-r border-gray-200">{/* Empty Bal column */}</td>
          <td className="px-2 py-2 text-sm text-center">{/* Empty % column */}</td>
        </tr>
      ))}
    </>
  );
};