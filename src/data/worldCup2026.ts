import qualifiersData from './qualifiers.json';

// Datos estructurales base para la Copa del Mundo 2026 (Estados Unidos, México, Canadá)
// Actualmente los grupos A a L tienen 48 equipos, pero solo los anfitriones están confirmados.

export interface PlaceholderTeam {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    flag: string; // Alias for GroupCard
    isPlaceholder: boolean;
    pj: number;
    dg: number;
    pts: number;
}

const createTbdTeam = (id: string, name: string = 'Por Definir'): PlaceholderTeam => ({
    id,
    name,
    shortName: 'TBD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Light_green_check.svg', 
    flag: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Light_green_check.svg',
    isPlaceholder: true,
    pj: 0, dg: 0, pts: 0
});

export const WORLD_CUP_2026_GROUPS = [
    {
        id: 'A',
        name: 'Grupo A',
        teams: [
            { id: 'MEX', name: 'México', shortName: 'MEX', logo: 'https://media.api-sports.io/football/teams/16.png', flag: 'https://media.api-sports.io/football/teams/16.png', isPlaceholder: false, pj: 0, dg: 0, pts: 0 },
            createTbdTeam('A2', 'Clasificado A2'),
            createTbdTeam('A3', 'Clasificado A3'),
            createTbdTeam('A4', 'Clasificado A4')
        ]
    },
    {
        id: 'B',
        name: 'Grupo B',
        teams: [
            { id: 'CAN', name: 'Canadá', shortName: 'CAN', logo: 'https://media.api-sports.io/football/teams/8.png', flag: 'https://media.api-sports.io/football/teams/8.png', isPlaceholder: false, pj: 0, dg: 0, pts: 0 },
            createTbdTeam('B2', 'Clasificado B2'),
            createTbdTeam('B3', 'Clasificado B3'),
            createTbdTeam('B4', 'Clasificado B4')
        ]
    },
    { id: 'C', name: 'Grupo C', teams: [createTbdTeam('C1'), createTbdTeam('C2'), createTbdTeam('C3'), createTbdTeam('C4')] },
    {
        id: 'D',
        name: 'Grupo D',
        teams: [
            { id: 'USA', name: 'USA', shortName: 'USA', logo: 'https://media.api-sports.io/football/teams/14.png', flag: 'https://media.api-sports.io/football/teams/14.png', isPlaceholder: false, pj: 0, dg: 0, pts: 0 },
            createTbdTeam('D2'), createTbdTeam('D3'), createTbdTeam('D4')
        ]
    },
    { id: 'E', name: 'Grupo E', teams: [createTbdTeam('E1'), createTbdTeam('E2'), createTbdTeam('E3'), createTbdTeam('E4')] },
    { id: 'F', name: 'Grupo F', teams: [createTbdTeam('F1'), createTbdTeam('F2'), createTbdTeam('F3'), createTbdTeam('F4')] },
    { id: 'G', name: 'Grupo G', teams: [createTbdTeam('G1'), createTbdTeam('G2'), createTbdTeam('G3'), createTbdTeam('G4')] },
    { id: 'H', name: 'Grupo H', teams: [createTbdTeam('H1'), createTbdTeam('H2'), createTbdTeam('H3'), createTbdTeam('H4')] },
    { id: 'I', name: 'Grupo I', teams: [createTbdTeam('I1'), createTbdTeam('I2'), createTbdTeam('I3'), createTbdTeam('I4')] },
    { id: 'J', name: 'Grupo J', teams: [createTbdTeam('J1'), createTbdTeam('J2'), createTbdTeam('J3'), createTbdTeam('J4')] },
    { id: 'K', name: 'Grupo K', teams: [createTbdTeam('K1'), createTbdTeam('K2'), createTbdTeam('K3'), createTbdTeam('K4')] },
    { id: 'L', name: 'Grupo L', teams: [createTbdTeam('L1'), createTbdTeam('L2'), createTbdTeam('L3'), createTbdTeam('L4')] },
];

export const QUALIFIERS_CONMEBOL = [
    { rank: 1, name: 'Argentina', logo: 'https://media.api-sports.io/football/teams/26.png', pj: 12, won: 8, drawn: 1, lost: 3, goalsFor: 21, goalsAgainst: 7, points: 25, status: 'Clasificación Directa' },
    { rank: 2, name: 'Uruguay', logo: 'https://media.api-sports.io/football/teams/7.png', pj: 12, won: 5, drawn: 5, lost: 2, goalsFor: 17, goalsAgainst: 9, points: 20, status: 'Clasificación Directa' },
    { rank: 3, name: 'Ecuador', logo: 'https://media.api-sports.io/football/teams/12.png', pj: 12, won: 6, drawn: 4, lost: 2, goalsFor: 11, goalsAgainst: 4, points: 19, status: 'Clasificación Directa' },
    { rank: 4, name: 'Colombia', logo: 'https://media.api-sports.io/football/teams/15.png', pj: 12, won: 5, drawn: 4, lost: 3, goalsFor: 15, goalsAgainst: 10, points: 19, status: 'Clasificación Directa' },
    { rank: 5, name: 'Brasil', logo: 'https://media.api-sports.io/football/teams/6.png', pj: 12, won: 5, drawn: 3, lost: 4, goalsFor: 17, goalsAgainst: 11, points: 18, status: 'Clasificación Directa' },
    { rank: 6, name: 'Paraguay', logo: 'https://media.api-sports.io/football/teams/13.png', pj: 12, won: 4, drawn: 5, lost: 3, goalsFor: 8, goalsAgainst: 7, points: 17, status: 'Clasificación Directa' },
    { rank: 7, name: 'Bolivia', logo: 'https://media.api-sports.io/football/teams/11.png', pj: 12, won: 4, drawn: 1, lost: 7, goalsFor: 13, goalsAgainst: 27, points: 13, status: 'Repechaje' },
    { rank: 8, name: 'Venezuela', logo: 'https://media.api-sports.io/football/teams/10.png', pj: 12, won: 2, drawn: 6, lost: 4, goalsFor: 11, goalsAgainst: 15, points: 12, status: 'Eliminado' },
    { rank: 9, name: 'Chile', logo: 'https://media.api-sports.io/football/teams/17.png', pj: 12, won: 2, drawn: 3, lost: 7, goalsFor: 9, goalsAgainst: 20, points: 9, status: 'Eliminado' },
    { rank: 10, name: 'Perú', logo: 'https://media.api-sports.io/football/teams/19.png', pj: 12, won: 1, drawn: 4, lost: 7, goalsFor: 3, goalsAgainst: 15, points: 7, status: 'Eliminado' },
];

export const WORLD_QUALIFIERS = qualifiersData;
