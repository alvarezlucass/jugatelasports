import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

interface TeamModalContextType {
    openTeamModal: (teamId: string | number) => void;
}

const TeamModalContext = createContext<TeamModalContextType>({ openTeamModal: () => {} });

export const useTeamModal = () => useContext(TeamModalContext);

export const TeamModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();

    const openTeamModal = (teamId: string | number) => {
        navigate(`/team/${teamId}`);
    };

    return (
        <TeamModalContext.Provider value={{ openTeamModal }}>
            {children}
        </TeamModalContext.Provider>
    );
};
