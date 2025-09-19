import React from 'react';
interface TeamSelectorProps {
  selectedTeam: number;
  onSelectTeam: (teamId: number) => void;
}
export const TeamSelector: React.FC<TeamSelectorProps> = ({
  selectedTeam,
  onSelectTeam
}) => {
  const teams = [{
    id: 1,
    name: 'Team 1'
  }, {
    id: 2,
    name: 'Team 2'
  }, {
    id: 3,
    name: 'Team 3'
  }, {
    id: 4,
    name: 'Team 4'
  }];
  return <div>
      <h2 className="text-lg font-semibold mb-3 text-cbc-dark-blue">
        Vælg team
      </h2>
      <div className="flex flex-wrap gap-2">
        {teams.map(team => <button key={team.id} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedTeam === team.id ? 'bg-cbc-dark-blue text-white' : 'bg-cbc-gray text-gray-700 hover:bg-cbc-gray hover:bg-opacity-70'}`} onClick={() => onSelectTeam(team.id)}>
            {team.name}
          </button>)}
      </div>
    </div>;
};