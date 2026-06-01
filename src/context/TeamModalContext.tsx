import React, { createContext, useContext, useState } from 'react';
import { TeamDetailsModal } from '../components/modals/TeamDetailsModal';

interface TeamModalContextType {
    openTeamModal: (teamId: string | number) => void;
}

const TeamModalContext = createContext<TeamModalContextType>({ openTeamModal: () => {} });

export const useTeamModal = () => useContext(TeamModalContext);

export const TeamModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [teamId, setTeamId] = useState<string | number | null>(null);

    return (
        <TeamModalContext.Provider value={{ openTeamModal: setTeamId }}>
            {children}
            <TeamDetailsModal 
                isOpen={teamId !== null} 
                teamId={teamId} 
                onClose={() => setTeamId(null)} 
            />
        </TeamModalContext.Provider>
    );
};
