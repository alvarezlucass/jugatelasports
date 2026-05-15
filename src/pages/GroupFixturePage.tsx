import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GroupFixtureView } from '../components/competition/GroupFixtureView';
import { getGroupMatches, getGroupStandings } from '../data/worldCupPersistence';

export const GroupFixturePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const groupLetter = id?.toUpperCase() || 'A';
    const matches = getGroupMatches(groupLetter);
    const standings = getGroupStandings(groupLetter);

    return (
        <GroupFixtureView
            groupLetter={groupLetter}
            matches={matches}
            standings={standings}
            onTeamClick={(name: string) => navigate(`/worldcup/team/${encodeURIComponent(name)}/squad`)}
        />
    );
};
