import React, { useState } from 'react';
import { CitizenTable } from './components/CitizenTable';
import { ServiceGraph } from './components/ServiceGraph';
import { TeamSummaryCard } from './components/TeamSummaryCard';
import { TeamSelector } from './components/TeamSelector';
import { Link } from 'react-router-dom';
import { BarChartIcon, ArrowLeftIcon } from 'lucide-react';
export function App() {
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [showAlerts, setShowAlerts] = useState<boolean>(true);
  const handleToggleAlerts = (value: boolean) => {
    setShowAlerts(value);
  };
  return <div className="min-h-screen bg-cbc-grey">
      <header className="bg-cbc-ps-grey border-b border-gray-200 shadow-sm">
        <div className="bg-cbc-beige container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-cbc-dark-blue">
            Planlægningskompas
          </h1>
          <Link to="/" className="flex items-center text-cbc-dark-blue hover:text-cbc-blue font-medium">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Tilbage til ledelseskompas
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 bg-cbc-grey">
        <div className="bg-cbc-grey rounded-lg shadow-lg overflow-hidden mb-6 p-4">
          <TeamSelector selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
        </div>
        <TeamSummaryCard teamId={selectedTeam} />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CitizenTable onSelectCitizen={setSelectedCitizen} selectedCitizen={selectedCitizen} teamId={selectedTeam} onToggleAlerts={handleToggleAlerts} />
          </div>
          {selectedCitizen === 3 ? <div className="bg-cbc-ps-grey p-4 rounded-lg shadow-lg">
              <h2 className="text-lg font-semibold mb-4 text-cbc-dark-blue">
                Borgerens udvikling
              </h2>
              <ServiceGraph citizenId={selectedCitizen} showAlert={showAlerts} />
            </div> : <div className="hidden lg:block">
              <div className="bg-cbc-ps-grey p-4 rounded-lg shadow-lg">
                <h2 className="text-lg font-semibold mb-4 text-cbc-dark-blue">
                  Vælg en borger
                </h2>
                <p className="text-gray-500">
                  Vælg en borger fra tabellen for at se detaljer om borgerens
                  udvikling.
                </p>
              </div>
            </div>}
        </div>
      </main>
    </div>;
}