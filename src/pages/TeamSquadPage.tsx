import React from 'react';
import { useParams } from 'react-router-dom';
import { TeamSquadView } from '../components/competition/TeamSquadView';
import { getTeamStaticData } from '../data/worldCupPersistence';

export const TeamSquadPage: React.FC = () => {
    const { teamName } = useParams<{ teamName: string }>();
    const decodedName = teamName ? decodeURIComponent(teamName) : 'México';
    const team = getTeamStaticData(decodedName);

    const teamInfo = team || {
        id: 'TEMP',
        name: decodedName,
        titles: 0,
        bestResult: "En proceso...",
        appearances: 0,
        lastResults: ['D', 'D', 'D'] as ('W' | 'D' | 'L')[],
        description: `Información detallada sobre la selección de ${decodedName} estará disponible próximamente mientras se confirman las plantillas oficiales y estadísticas para el Mundial 2026.`,
        continent: "Global",
        coachingStaff: [],
        players: []
    };

    return <TeamSquadView team={teamInfo} />;
};
