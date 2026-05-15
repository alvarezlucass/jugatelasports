
import type { Team, Match, Player } from '../types';

export const MOCK_TEAMS: Team[] = [
    {
        id: 'team-arg',
        name: 'Argentina',
        shortName: 'ARG',
        logo: 'https://media.api-sports.io/football/teams/26.png',
        colors: ['#75aadb', '#ffffff']
    },
    {
        id: 'team-fra',
        name: 'Francia',
        shortName: 'FRA',
        logo: 'https://media.api-sports.io/football/teams/2.png',
        colors: ['#002395', '#ffffff']
    },
    {
        id: 'team-bra',
        name: 'Brasil',
        shortName: 'BRA',
        logo: 'https://media.api-sports.io/football/teams/6.png',
        colors: ['#fde100', '#009b3a']
    },
    {
        id: 'team-eng',
        name: 'Inglaterra',
        shortName: 'ENG',
        logo: 'https://media.api-sports.io/football/teams/10.png',
        colors: ['#ffffff', '#ce1124']
    }
];

export const MOCK_MATCHES: Match[] = [
    {
        id: 'match-1',
        homeTeam: MOCK_TEAMS[0],
        awayTeam: MOCK_TEAMS[1],
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        status: 'UPCOMING',
        odds: {
            home: 2.10,
            draw: 3.20,
            away: 3.50
        },
        predictionCounts: {
            home: 45,
            draw: 12,
            away: 28
        }
    },
    {
        id: 'match-2',
        homeTeam: MOCK_TEAMS[2],
        awayTeam: MOCK_TEAMS[3],
        date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        status: 'UPCOMING',
        odds: {
            home: 1.95,
            draw: 3.40,
            away: 4.00
        },
        predictionCounts: {
            home: 62,
            draw: 8,
            away: 15
        }
    }
];

export const MOCK_GROUPS: any[] = [
    {
        id: 'g1',
        name: 'Asado Mundialista',
        members: ['u1', 'u2', 'u3'],
        lastMessage: {
            text: '¿Quién pone para la picada?',
            timestamp: new Date().toISOString(),
            senderName: 'Carlos'
        }
    },
    {
        id: 'g2',
        name: 'Los Pibes del Fulbo',
        members: ['u1', 'u4'],
        lastMessage: {
            text: '¡Mañana ganamos sí o sí!',
            timestamp: new Date().toISOString(),
            senderName: 'Mati'
        }
    }
];

const MOCK_PLAYERS: Player[] = [
    {
        id: 'p1',
        name: 'Kylian Mbappé',
        number: 10,
        position: 'FWD',
        teamId: 'team-fra',
        photo: 'https://media.api-sports.io/football/players/278.png'
    },
    {
        id: 'p2',
        name: 'Lionel Messi',
        number: 10,
        position: 'FWD',
        teamId: 'team-arg',
        photo: 'https://media.api-sports.io/football/players/154.png'
    }
];

export const MOCK_STATS = {
    topScorers: MOCK_PLAYERS,
    teamStats: [
        {
            label: "Goles por Partido",
            teamOne: { name: "Argentina", value: 2.5, color: "#75aadb" },
            teamTwo: { name: "Francia", value: 2.1, color: "#002395" }
        },
        {
            label: "Posesión Promedio",
            teamOne: { name: "Brasil", value: "58%", color: "#fde100" },
            teamTwo: { name: "Inglaterra", value: "54%", color: "#ce1124" }
        }
    ]
};
