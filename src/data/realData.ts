import type { Match, Team } from '../types';
import teamsJson from './api-football/teams.json';
import fixturesJson from './api-football/fixtures.json';
import standingsJson from './api-football/standings.json';

// --- MAPPING TEAMS ---
// api-football teams: [{ team: { id, name, logo, code }, venue: {} }, ...]
export const API_TEAMS = teamsJson.map(item => ({
    id: item.team.id.toString(),
    name: item.team.name,
    shortName: item.team.code || item.team.name.substring(0, 3).toUpperCase(),
    logo: item.team.logo,
    colors: ['#000000', '#ffffff'] as [string, string] // fallback colors since API doesn't provide them reliably here
}));

function getTeamById(id: number | string): Team | undefined {
    return API_TEAMS.find(t => t.id === id.toString());
}

// --- MAPPING MATCHES (FIXTURES) ---
// api-football fixtures: [{ fixture: { id, date, status }, teams: { home, away }, goals, score }, ...]
export const API_MATCHES: Match[] = fixturesJson.map(item => {
    const homeTeam = getTeamById(item.teams.home.id) || {
        id: item.teams.home.id.toString(),
        name: item.teams.home.name,
        shortName: item.teams.home.name.substring(0, 3).toUpperCase(),
        logo: item.teams.home.logo,
        colors: ['#000000', '#ffffff']
    };

    const awayTeam = getTeamById(item.teams.away.id) || {
        id: item.teams.away.id.toString(),
        name: item.teams.away.name,
        shortName: item.teams.away.name.substring(0, 3).toUpperCase(),
        logo: item.teams.away.logo,
        colors: ['#000000', '#ffffff']
    };

    let status: 'UPCOMING' | 'LIVE' | 'FINISHED' = 'UPCOMING';
    if (item.fixture.status.short === 'FT' || item.fixture.status.short === 'AET' || item.fixture.status.short === 'PEN') {
        status = 'FINISHED';
    } else if (['1H', 'HT', '2H', 'ET', 'P', 'LIVE'].includes(item.fixture.status.short)) {
        status = 'LIVE';
    }

    return {
        id: item.fixture.id.toString(),
        homeTeam,
        awayTeam,
        date: item.fixture.date, // ISO string
        status,
        odds: {
            home: 2.1, draw: 3.1, away: 2.5 // Mock odds since free API tier rarely provides accurate pre-match odds in this endpoint
        },
        score: status === 'FINISHED' || status === 'LIVE' ? {
            home: item.goals.home ?? 0,
            away: item.goals.away ?? 0
        } : undefined,
        predictionCounts: {
            home: Math.floor(Math.random() * 5000),
            draw: Math.floor(Math.random() * 2000),
            away: Math.floor(Math.random() * 4000)
        }
    };
});

// --- MAPPING GROUPS (STANDINGS) ---
// api-football standings: [{ league: { standings: [[{ rank, team, points, all: { played, win, draw, lose, goals } }, ...], ...] } }]
export const API_GROUPS: any[] = [];

if (standingsJson.length > 0 && standingsJson[0].league && standingsJson[0].league.standings) {
    const standingsArrays = standingsJson[0].league.standings;
    
    standingsArrays.forEach(groupArray => {
        if (groupArray.length === 0) return;
        
        // El nombre del grupo viene en groupArray[0].group (ej. "Group A")
        const groupNameText = groupArray[0].group; // "Group A"
        const groupId = groupNameText.replace('Group ', ''); // "A"

        const teams = groupArray.map(item => {
            const teamInfo = getTeamById(item.team.id) || {
                id: item.team.id.toString(),
                name: item.team.name,
                shortName: item.team.name.substring(0, 3).toUpperCase(),
                logo: item.team.logo,
                colors: ['#000000', '#ffffff'] as [string, string]
            };

            return {
                id: teamInfo.id,
                name: teamInfo.name,
                logo: teamInfo.logo,
                played: item.all.played,
                won: item.all.win,
                drawn: item.all.draw,
                lost: item.all.lose,
                goalDifference: item.goalsDiff,
                points: item.points,
                // Add aliases for GroupCard compatibility
                flag: teamInfo.logo,
                pj: item.all.played,
                dg: item.goalsDiff,
                pts: item.points
            };
        });

        // Partidos del grupo
        // Simplificación: iterar matches y si ambos equipos están en el grupo, pertenece a este grupo
        const teamIds = teams.map(t => t.id);
        const groupMatches = API_MATCHES.filter(m => 
            teamIds.includes(m.homeTeam.id) && teamIds.includes(m.awayTeam.id)
        );

        API_GROUPS.push({
            id: groupId,
            name: `Grupo ${groupId}`,
            teams,
            matches: groupMatches
        });
    });
}
