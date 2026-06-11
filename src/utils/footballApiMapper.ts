import { MatchEvent, MatchLineup, MatchStats, Player } from '../types';

export const mapApiFootballEvents = (apiEvents: any[], homeTeamId: string, awayTeamId: string): MatchEvent[] => {
    if (!apiEvents || !Array.isArray(apiEvents)) return [];

    return apiEvents.map((e: any, index: number) => {
        let type: MatchEvent['type'] = 'GOAL';
        if (e.type === 'Card') type = 'CARD';
        else if (e.type === 'subst') type = 'SUB';
        else if (e.type === 'Var') type = 'VAR';

        const teamId = e.team.id?.toString() === homeTeamId ? homeTeamId : awayTeamId;
        
        return {
            id: `evt-${e.time.elapsed}-${index}`,
            time: e.time.elapsed + (e.time.extra ? `+${e.time.extra}` : ''),
            type,
            teamId,
            player: {
                id: e.player.id?.toString() || '',
                name: e.player.name || '',
                number: 0,
                position: 'MID', // Placeholder
                teamId
            },
            assistPlayer: e.assist?.id ? {
                id: e.assist.id?.toString() || '',
                name: e.assist.name || '',
                number: 0,
                position: 'MID',
                teamId
            } : undefined,
            detail: e.detail
        };
    });
};

export const mapApiFootballStatistics = (apiStats: any[]): MatchStats => {
    const stats: MatchStats = {
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        shotsOnGoal: { home: 0, away: 0 },
        passes: { home: 0, away: 0 },
        corners: { home: 0, away: 0 }
    };

    if (!apiStats || apiStats.length !== 2) return stats;

    const home = apiStats[0].statistics;
    const away = apiStats[1].statistics;

    const getStat = (arr: any[], type: string) => {
        const item = arr.find(s => s.type === type);
        if (!item || !item.value) return 0;
        if (typeof item.value === 'string' && item.value.includes('%')) {
            return parseInt(item.value.replace('%', ''));
        }
        return parseInt(item.value);
    };

    stats.possession = {
        home: getStat(home, 'Ball Possession') || 50,
        away: getStat(away, 'Ball Possession') || 50
    };
    stats.shots = {
        home: getStat(home, 'Total Shots'),
        away: getStat(away, 'Total Shots')
    };
    stats.shotsOnGoal = {
        home: getStat(home, 'Shots on Goal'),
        away: getStat(away, 'Shots on Goal')
    };
    stats.passes = {
        home: getStat(home, 'Total passes'),
        away: getStat(away, 'Total passes')
    };
    stats.corners = {
        home: getStat(home, 'Corner Kicks'),
        away: getStat(away, 'Corner Kicks')
    };

    return stats;
};

export const mapApiFootballLineups = (apiLineups: any[]): { home: MatchLineup | null, away: MatchLineup | null } => {
    if (!apiLineups || apiLineups.length !== 2) return { home: null, away: null };

    const mapLineup = (l: any): MatchLineup => {
        return {
            teamId: l.team.id?.toString() || '',
            formation: l.formation || '4-4-2',
            startXI: l.startXI.map((item: any) => ({
                player: {
                    id: item.player.id?.toString(),
                    name: item.player.name,
                    number: item.player.number,
                    position: item.player.pos,
                    teamId: l.team.id?.toString(),
                    isStarter: true
                },
                pos: item.player.pos,
                grid: item.player.grid
            })),
            substitutes: l.substitutes.map((item: any) => ({
                player: {
                    id: item.player.id?.toString(),
                    name: item.player.name,
                    number: item.player.number,
                    position: item.player.pos,
                    teamId: l.team.id?.toString(),
                    isStarter: false
                }
            })),
            staff: l.coach?.id ? [{
                name: l.coach.name,
                role: 'Head Coach',
                photo: l.coach.photo
            }] : []
        };
    };

    return {
        home: mapLineup(apiLineups[0]),
        away: mapLineup(apiLineups[1])
    };
};
