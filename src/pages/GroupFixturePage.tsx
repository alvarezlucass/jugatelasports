import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GroupFixtureView } from '../components/competition/GroupFixtureView';
import { getGroupMatches, getGroupStandings, WORLD_CUP_GROUP_MATCHES } from '../data/worldCupPersistence';
import { useUser } from '../contexts/UserContext';
import { Loader2 } from 'lucide-react';
import { matchService } from '../services/matchService';

export const GroupFixturePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const groupLetter = id?.toUpperCase() || 'A';
    const { userPredictions } = useUser();
    const [realMatches, setRealMatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRealMatches = async () => {
            setIsLoading(true);
            try {
                const groupMatchIds = WORLD_CUP_GROUP_MATCHES.filter(m => m.group === groupLetter).map(m => m.id);
                const matches = await matchService.getMatches(undefined, { ids: groupMatchIds, limit: 1000 });
                setRealMatches(matches);
            } catch (err) {
                console.error("Error fetching real matches", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRealMatches();
    }, []);

    const baseMatches = getGroupMatches(groupLetter);
    const matches = baseMatches.map(m => {
        const real = realMatches.find(rm => rm.id === m.id || (rm.homeTeam === m.homeTeam && rm.awayTeam === m.awayTeam));
        if (real) {
            return {
                ...m,
                date: real.date || m.date,
                time: real.time || m.time,
                status: real.status || m.status,
                homeScore: real.homeScore ?? m.homeScore,
                awayScore: real.awayScore ?? m.awayScore,
            };
        }
        return m;
    });
    const standings = getGroupStandings(groupLetter, userPredictions, realMatches);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <GroupFixtureView
            groupLetter={groupLetter}
            matches={matches}
            standings={standings}
            onTeamClick={(name: string) => navigate(`/worldcup/team/${encodeURIComponent(name)}/squad`)}
        />
    );
};
