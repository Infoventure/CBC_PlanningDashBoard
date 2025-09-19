import React, { useState } from 'react';
import { TeamSelector } from '../components/TeamSelector';
import { TeamOverview } from '../components/TeamOverview';
import { TeamSummary } from '../components/TeamSummary';
import { TeamComparison } from '../components/TeamComparison';
import { DetailedDataTable } from '../components/DetailedDataTable';
import { Link } from 'react-router-dom';
import { UsersIcon } from 'lucide-react';
export const ManagementOverview: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<number>(1);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  return <div className="min-h-screen bg-cbc-grey">
      <header className="bg-cbc-beige border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-cbc-dark-blue">
            Taktisk ledelseskompas
          </h1>
          <Link to="/citizens" className="flex items-center text-cbc-dark-blue hover:text-cbc-blue font-medium">
            <UsersIcon className="h-4 w-4 mr-1" />
            Planlægningskompas
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="bg-cbc-ps-grey rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap justify-between items-center">
              <TeamSelector selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
              <button onClick={() => setShowComparison(!showComparison)} className="mt-3 sm:mt-0 px-4 py-2 bg-cbc-dark-blue text-white rounded-md text-sm font-medium hover:bg-cbc-blue transition-colors">
                {showComparison ? 'Vis team detaljer' : 'Sammenlign med andre teams'}
              </button>
            </div>
          </div>
          {showComparison ? <TeamComparison /> : <>
              <div className="p-4">
                <TeamSummary teamId={selectedTeam} />
              </div>
              <TeamOverview teamId={selectedTeam} />
              <div className="p-4 pt-0">
                <DetailedDataTable teamId={selectedTeam} />
              </div>
            </>}
        </div>
      </main>
    </div>;
};