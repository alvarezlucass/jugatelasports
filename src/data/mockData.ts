import type { Match, Team, User, Reward, Player } from '../types';

export const TEAMS: Record<string, Team> = {
    river: { id: 'river', name: 'River Plate', shortName: 'RIV', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Logo_River_Plate.png', colors: ['#FFFFFF', '#D91F26'] },
    boca: { id: 'boca', name: 'Boca Juniors', shortName: 'BOC', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Escudo_Boca_Juniors_2012.svg', colors: ['#003399', '#FFCC00'] },
    racing: { id: 'racing', name: 'Racing Club', shortName: 'RAC', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Escudo_de_Racing_Club_%282014%29.svg', colors: ['#69B3E7', '#FFFFFF'] },
    independiente: { id: 'independiente', name: 'Independiente', shortName: 'IND', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Escudo_del_Club_Atl%C3%A9tico_Independiente.svg', colors: ['#E2001A', '#FFFFFF'] },
    sanlorenzo: { id: 'sanlorenzo', name: 'San Lorenzo', shortName: 'SLO', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Escudo_San_Lorenzo.svg', colors: ['#0A254F', '#B52126'] },
    huracan: { id: 'huracan', name: 'Huracán', shortName: 'HUR', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Huracan.svg', colors: ['#FFFFFF', '#D91F26'] },
};

export const MOCK_USER: User = {
    id: 'user-1',
    name: 'Martín',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Martin',
    tokens: 1500,
    points: 450,
    level: 5,
    streak: 2,
    groups: ['Amigos del Fútbol 5', 'Oficina - Piso 3'],
};

export const MOCK_MATCHES: Match[] = [
    {
        id: 'm1',
        homeTeam: TEAMS.river,
        awayTeam: TEAMS.boca,
        date: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
        status: 'UPCOMING',
        odds: { home: 2.10, draw: 3.20, away: 2.80 },
    },
    {
        id: 'm2',
        homeTeam: TEAMS.racing,
        awayTeam: TEAMS.independiente,
        date: new Date(Date.now() + 86400000 * 3).toISOString(),
        status: 'UPCOMING',
        odds: { home: 2.40, draw: 3.00, away: 2.60 },
    },
    {
        id: 'm3',
        homeTeam: TEAMS.sanlorenzo,
        awayTeam: TEAMS.huracan,
        date: new Date(Date.now() + 3600000 * 5).toISOString(), // 5 hours from now
        status: 'UPCOMING',
        odds: { home: 2.20, draw: 3.10, away: 2.90 },
    },
];

export const MOCK_REWARDS: Reward[] = [
    { id: 'r1', name: 'Cupón MercadoLibre $500', cost: 1000, imageUrl: 'https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo__large_plus.png', category: 'DIGITAL', description: 'Crédito para tus compras.' },
    { id: 'r2', name: 'Camiseta Selección', cost: 5000, imageUrl: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/89fdf4fc07d94f279148a042e6162590_9366/Camiseta_Titular_Seleccion_Argentina_24_Blanco_IP8409_21_model.jpg', category: 'PHYSICAL', description: 'Camiseta oficial AFA 3 estrellas.' },
    { id: 'r3', name: 'Entrada Partido', cost: 15000, imageUrl: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?auto=format&fit=crop&q=80&w=1000', category: 'PREMIUM', description: '2 plateas para el próximo clásico.' },
];



export const MOCK_PLAYERS: Player[] = [
    // River
    { id: 'rp1', name: 'Armani', number: 1, position: 'GK', teamId: 'river' },
    { id: 'rp2', name: 'Paulo Díaz', number: 17, position: 'DEF', teamId: 'river' },
    { id: 'rp3', name: 'González Pirez', number: 14, position: 'DEF', teamId: 'river' },
    { id: 'rp4', name: 'Enzo Díaz', number: 13, position: 'DEF', teamId: 'river' },
    { id: 'rp5', name: 'Casco', number: 20, position: 'DEF', teamId: 'river' },
    { id: 'rp6', name: 'Aliendro', number: 29, position: 'MID', teamId: 'river' },
    { id: 'rp7', name: 'Kranevitter', number: 5, position: 'MID', teamId: 'river' },
    { id: 'rp8', name: 'Nacho Fernández', number: 26, position: 'MID', teamId: 'river' },
    { id: 'rp9', name: 'Echeverri', number: 19, position: 'MID', teamId: 'river' },
    { id: 'rp10', name: 'Borja', number: 9, position: 'FWD', teamId: 'river' },
    { id: 'rp11', name: 'Solari', number: 36, position: 'FWD', teamId: 'river' },
    { id: 'rp12', name: 'Colidio', number: 11, position: 'FWD', teamId: 'river' },
    { id: 'rp13', name: 'Lanzini', number: 10, position: 'MID', teamId: 'river' },
    { id: 'rp14', name: 'Simón', number: 31, position: 'MID', teamId: 'river' },

    // Boca
    { id: 'bj1', name: 'Romero', number: 1, position: 'GK', teamId: 'boca' },
    { id: 'bj2', name: 'Advíncula', number: 17, position: 'DEF', teamId: 'boca' },
    { id: 'bj3', name: 'Rojo', number: 6, position: 'DEF', teamId: 'boca' },
    { id: 'bj4', name: 'Figal', number: 4, position: 'DEF', teamId: 'boca' },
    { id: 'bj5', name: 'Blanco', number: 23, position: 'DEF', teamId: 'boca' },
    { id: 'bj6', name: 'Medina', number: 36, position: 'MID', teamId: 'boca' },
    { id: 'bj7', name: 'Equi Fernández', number: 21, position: 'MID', teamId: 'boca' },
    { id: 'bj8', name: 'Zenón', number: 22, position: 'MID', teamId: 'boca' },
    { id: 'bj9', name: 'Cavani', number: 10, position: 'FWD', teamId: 'boca' },
    { id: 'bj10', name: 'Merentiel', number: 16, position: 'FWD', teamId: 'boca' },
    { id: 'bj11', name: 'Langoni', number: 14, position: 'FWD', teamId: 'boca' },
    { id: 'bj12', name: 'Saralegui', number: 47, position: 'MID', teamId: 'boca' },
    { id: 'bj13', name: 'Lema', number: 2, position: 'DEF', teamId: 'boca' },
    { id: 'bj14', name: 'Benedetto', number: 9, position: 'FWD', teamId: 'boca' },
];
