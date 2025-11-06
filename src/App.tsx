import React, { useState } from 'react';
import { CitizenTable } from './components/CitizenTable';
import { ServiceGraph } from './components/ServiceGraph';
import { TeamSummaryCard } from './components/TeamSummaryCard';
import { TeamSelector } from './components/TeamSelector';
import { Link } from 'react-router-dom';
import { BarChartIcon, ArrowLeftIcon, MaximizeIcon, MinimizeIcon } from 'lucide-react';

export function App() {
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-[#1d3557]">
            Planlægningskompas
          </h1>
          <Link
            to="/"
            className="flex items-center text-[#1d3557] hover:text-[#152843] font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Tilbage til ledelseskompas
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6 p-4">
          <TeamSelector selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
        </div>

        <TeamSummaryCard teamId={selectedTeam} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CitizenTable
              onSelectCitizen={setSelectedCitizen}
              selectedCitizen={selectedCitizen}
              teamId={selectedTeam}
            />
          </div>

          {selectedCitizen ? (
            <div
              className={`bg-white p-4 rounded-lg shadow-lg transition-all ${
                isFullscreen
                  ? 'absolute left-1/2 -translate-x-1/2 w-[80vw] z-50 shadow-2xl shadow-black border-2 border-gray-600'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#1d3557]">
                  Borgerens udvikling
                </h2>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1 rounded hover:bg-gray-200"
                >
                  {isFullscreen ? (
                    <MinimizeIcon className="w-5 h-5" />
                  ) : (
                    <MaximizeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <ServiceGraph citizenId={selectedCitizen} />
            </div>
          ) : (
            <div className="hidden lg:block">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4 text-[#1d3557]">
                  Vælg en borger
                </h2>
                <p className="text-gray-500">
                  Vælg en borger fra tabellen for at se detaljer om borgerens
                  udvikling.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
