export interface TeamHistory {
    id: string;
    name: string;
    titles: number;
    bestResult: string;
    appearances: number;
    lastResults: ('W' | 'D' | 'L')[];
    fifaRanking?: number;
    continent?: string;
    description: string;
    detailedHistory?: string;
    culture?: {
        capital: string;
        population: string;
        curiosity: string;
    };
    coachingStaff?: StaffMember[];
    players?: Player[];
}

export interface Venue {
    id: string;
    name: string;
    city: string;
    country: string;
    capacity: number;
    image: string;
    description: string;
    website?: string;
}



export interface StaffMember {
    id: string;
    name: string;
    role: string;
    image?: string;
}

export interface Player {
    id: string;
    name: string;
    position: 'G' | 'D' | 'M' | 'F'; // Goalkeeper, Defender, Midfielder, Forward
    number: number;
    club: string;
    age: number;
    isStar?: boolean;
    image?: string;
}

export const WORLD_CUP_TEAMS_HISTORY: Record<string, TeamHistory> = {
    "Argentina": { id: "ARG", name: "Argentina", titles: 3, bestResult: "Campeón (1978, 1986, 2022)", appearances: 18, lastResults: ['W', 'W', 'D', 'W', 'W'], fifaRanking: 1, continent: "Sudamérica", description: "Vigente campeón mundial." },
    "México": { id: "MEX", name: "México", titles: 0, bestResult: "Cuartos (1970, 1986)", appearances: 17, lastResults: ['D', 'W', 'L', 'W', 'D'], fifaRanking: 15, continent: "Concacaf", description: "Anfitrión." },
    "Brasil": { id: "BRA", name: "Brasil", titles: 5, bestResult: "Campeón (x5)", appearances: 22, lastResults: ['W', 'L', 'W', 'W', 'D'], fifaRanking: 5, continent: "Sudamérica", description: "El Pentacampeón." },
    "España": { id: "ESP", name: "España", titles: 1, bestResult: "Campeón (2010)", appearances: 16, lastResults: ['W', 'W', 'W', 'D', 'W'], fifaRanking: 3, continent: "Europa", description: "La Roja." },
    "USA": { id: "USA", name: "USA", titles: 0, bestResult: "Semis (1930)", appearances: 11, lastResults: ['W', 'D', 'W', 'L', 'W'], fifaRanking: 13, continent: "Concacaf", description: "Anfitrión." },
    "Canadá": { id: "CAN", name: "Canadá", titles: 0, bestResult: "Fase de Grupos", appearances: 3, lastResults: ['W', 'W', 'L', 'W', 'D'], fifaRanking: 40, continent: "Concacaf", description: "Anfitrión." },
    "Francia": { id: "FRA", name: "Francia", titles: 2, bestResult: "Campeón (1998, 2018)", appearances: 16, lastResults: ['W', 'W', 'L', 'W', 'W'], fifaRanking: 2, continent: "Europa", description: "Les Bleus." },
    "Alemania": { id: "GER", name: "Alemania", titles: 4, bestResult: "Campeón (x4)", appearances: 20, lastResults: ['W', 'D', 'W', 'L', 'D'], fifaRanking: 16, continent: "Europa", description: "Mannschaft." },
    "Corea del Sur": { id: "KOR", name: "Corea del Sur", titles: 0, bestResult: "Cuarto Lugar (2002)", appearances: 11, lastResults: ['W', 'D', 'L', 'W', 'W'], fifaRanking: 23, continent: "Asia", description: "Tigres de Asia." },
    "República Checa": { id: "CZE", name: "República Checa", titles: 0, bestResult: "Subcampeón (con Checoslovaquia)", appearances: 10, lastResults: ['W', 'L', 'D', 'W', 'W'], fifaRanking: 36, continent: "Europa", description: "Chequia." },
    "Sudáfrica": { id: "RSA", name: "Sudáfrica", titles: 0, bestResult: "Fase de Grupos", appearances: 4, lastResults: ['L', 'W', 'D', 'L', 'W'], fifaRanking: 59, continent: "África", description: "Bafana Bafana." },
    "Australia": { id: "AUS", name: "Australia", titles: 0, bestResult: "Octavos", appearances: 6, lastResults: ['W', 'W', 'L', 'D', 'W'], fifaRanking: 24, continent: "Asia", description: "Socceroos." },
    "Arabia Saudita": { id: "KSA", name: "Arabia Saudita", titles: 0, bestResult: "Octavos", appearances: 7, lastResults: ['L', 'L', 'W', 'D', 'L'], fifaRanking: 53, continent: "Asia", description: "Halcones Verdes." },
    "Bosnia": { id: "BIH", name: "Bosnia", titles: 0, bestResult: "Fase de Grupos", appearances: 2, lastResults: ['L', 'W', 'L', 'D', 'W'], fifaRanking: 70, continent: "Europa", description: "Dragones." },
    "Qatar": { id: "QAT", name: "Qatar", titles: 0, bestResult: "Fase de Grupos", appearances: 2, lastResults: ['L', 'L', 'L', 'W', 'W'], fifaRanking: 34, continent: "Asia", description: "The Maroons." },
    "Suiza": { id: "SUI", name: "Suiza", titles: 0, bestResult: "Cuartos", appearances: 13, lastResults: ['W', 'D', 'W', 'L', 'D'], fifaRanking: 19, continent: "Europa", description: "Nati." },
    "Haití": { id: "HAI", name: "Haití", titles: 0, bestResult: "Fase de Grupos", appearances: 2, lastResults: ['W', 'L', 'L', 'W', 'D'], fifaRanking: 90, continent: "Concacaf", description: "Grenadiers." },
    "Marruecos": { id: "MAR", name: "Marruecos", titles: 0, bestResult: "Cuarto Lugar (2022)", appearances: 7, lastResults: ['W', 'W', 'W', 'D', 'L'], fifaRanking: 12, continent: "África", description: "Leones del Atlas." },
    "Escocia": { id: "SCO", name: "Escocia", titles: 0, bestResult: "Fase de Grupos", appearances: 9, lastResults: ['L', 'D', 'W', 'L', 'W'], fifaRanking: 39, continent: "Europa", description: "Tartan Army." },
    "Paraguay": { id: "PAR", name: "Paraguay", titles: 0, bestResult: "Cuartos", appearances: 9, lastResults: ['D', 'L', 'W', 'D', 'W'], fifaRanking: 56, continent: "Sudamérica", description: "Albirroja." },
    "Turquía": { id: "TUR", name: "Turquía", titles: 0, bestResult: "Tercer Lugar (2002)", appearances: 3, lastResults: ['W', 'L', 'W', 'D', 'W'], fifaRanking: 40, continent: "Europa", description: "Ay-Yıldızlılar." },
    "Curazao": { id: "CUW", name: "Curazao", titles: 0, bestResult: "Debutante", appearances: 1, lastResults: ['W', 'W', 'D', 'W', 'W'], fifaRanking: 91, continent: "Concacaf", description: "Debutante." },
    "Ecuador": { id: "ECU", name: "Ecuador", titles: 0, bestResult: "Octavos", appearances: 5, lastResults: ['W', 'D', 'L', 'W', 'W'], fifaRanking: 31, continent: "Sudamérica", description: "La Tri." },
    "Costa de Marfil": { id: "CIV", name: "Costa de Marfil", titles: 0, bestResult: "Fase de Grupos", appearances: 4, lastResults: ['W', 'L', 'W', 'D', 'W'], fifaRanking: 38, continent: "África", description: "Elefantes." },
    "Países Bajos": { id: "NED", name: "Países Bajos", titles: 0, bestResult: "Subcampeón", appearances: 12, lastResults: ['W', 'D', 'W', 'W', 'L'], fifaRanking: 7, continent: "Europa", description: "Oranje." },
    "Japón": { id: "JPN", name: "Japón", titles: 0, bestResult: "Octavos", appearances: 8, lastResults: ['W', 'W', 'L', 'W', 'W'], fifaRanking: 18, continent: "Asia", description: "Samuráis Blue." },
    "Suecia": { id: "SWE", name: "Suecia", titles: 0, bestResult: "Subcampeón (1958)", appearances: 13, lastResults: ['D', 'W', 'L', 'W', 'W'], fifaRanking: 27, continent: "Europa", description: "Blågult." },
    "Túnez": { id: "TUN", name: "Túnez", titles: 0, bestResult: "Fase de Grupos", appearances: 7, lastResults: ['L', 'W', 'D', 'L', 'W'], fifaRanking: 41, continent: "África", description: "Águilas de Cartago." },
    "Bélgica": { id: "BEL", name: "Bélgica", titles: 0, bestResult: "Tercer Lugar (2018)", appearances: 14, lastResults: ['W', 'L', 'D', 'W', 'W'], fifaRanking: 4, continent: "Europa", description: "Diablos Rojos." },
    "Egipto": { id: "EGY", name: "Egipto", titles: 0, bestResult: "Fase de Grupos", appearances: 4, lastResults: ['W', 'D', 'W', 'L', 'W'], fifaRanking: 30, continent: "África", description: "Faraones." },
    "Irán": { id: "IRN", name: "Irán", titles: 0, bestResult: "Fase de Grupos", appearances: 7, lastResults: ['W', 'L', 'W', 'D', 'W'], fifaRanking: 20, continent: "Asia", description: "Team Melli." },
    "Nueva Zelanda": { id: "NZL", name: "Nueva Zelanda", titles: 0, bestResult: "Fase de Grupos", appearances: 3, lastResults: ['W', 'W', 'D', 'W', 'W'], fifaRanking: 103, continent: "Oceanía", description: "All Whites." },
    "Cabo Verde": { id: "CPV", name: "Cabo Verde", titles: 0, bestResult: "Debutante", appearances: 1, lastResults: ['W', 'D', 'W', 'L', 'W'], fifaRanking: 65, continent: "África", description: "Tiburones Azules." },
    "Uruguay": { id: "URU", name: "Uruguay", titles: 2, bestResult: "Campeón", appearances: 15, lastResults: ['D', 'W', 'W', 'L', 'W'], fifaRanking: 11, continent: "Sudamérica", description: "La Celeste." },
    "Noruega": { id: "NOR", name: "Noruega", titles: 0, bestResult: "Octavos", appearances: 4, lastResults: ['W', 'D', 'L', 'W', 'D'], fifaRanking: 47, continent: "Europa", description: "Vikingos." },
    "Senegal": { id: "SEN", name: "Senegal", titles: 0, bestResult: "Cuartos", appearances: 4, lastResults: ['W', 'W', 'D', 'L', 'W'], fifaRanking: 17, continent: "África", description: "Leones de la Teranga." },
    "Irak": { id: "IRQ", name: "Irak", titles: 0, bestResult: "Fase de Grupos", appearances: 2, lastResults: ['W', 'L', 'D', 'W', 'W'], fifaRanking: 58, continent: "Asia", description: "Leones de Mesopotamia." },
    "Argelia": { id: "ALG", name: "Argelia", titles: 0, bestResult: "Octavos", appearances: 5, lastResults: ['W', 'D', 'L', 'W', 'W'], fifaRanking: 43, continent: "África", description: "Zorros del Desierto." },
    "Austria": { id: "AUT", name: "Austria", titles: 0, bestResult: "Tercer Lugar (1954)", appearances: 8, lastResults: ['D', 'W', 'W', 'L', 'D'], fifaRanking: 25, continent: "Europa", description: "Das Team." },
    "Jordania": { id: "JOR", name: "Jordania", titles: 0, bestResult: "Debutante", appearances: 1, lastResults: ['W', 'D', 'W', 'W', 'D'], fifaRanking: 71, continent: "Asia", description: "Los Valientes." },
    "Portugal": { id: "POR", name: "Portugal", titles: 0, bestResult: "Tercer Lugar (1966)", appearances: 9, lastResults: ['W', 'W', 'L', 'D', 'W'], fifaRanking: 6, continent: "Europa", description: "Seleção." },
    "RD Congo": { id: "COD", name: "RD Congo", titles: 0, bestResult: "Debutante", appearances: 1, lastResults: ['W', 'W', 'L', 'W', 'D'], fifaRanking: 63, continent: "África", description: "Los Leopardos." },
    "Uzbekistán": { id: "UZB", name: "Uzbekistán", titles: 0, bestResult: "Debutante", appearances: 1, lastResults: ['W', 'W', 'D', 'L', 'W'], fifaRanking: 64, continent: "Asia", description: "Lobos Blancos." },
    "Colombia": { id: "COL", name: "Colombia", titles: 0, bestResult: "Cuartos (2014)", appearances: 7, lastResults: ['W', 'W', 'D', 'W', 'W'], fifaRanking: 12, continent: "Sudamérica", description: "Los Cafeteros." },
    "Inglaterra": { id: "ENG", name: "Inglaterra", titles: 1, bestResult: "Campeón (1966)", appearances: 17, lastResults: ['W', 'D', 'W', 'L', 'W'], fifaRanking: 4, continent: "Europa", description: "Three Lions." },
    "Croacia": { id: "CRO", name: "Croacia", titles: 0, bestResult: "Subcampeón (2018)", appearances: 7, lastResults: ['W', 'D', 'W', 'W', 'L'], fifaRanking: 10, continent: "Europa", description: "Vatreni." },
    "Ghana": { id: "GHA", name: "Ghana", titles: 0, bestResult: "Cuartos", appearances: 5, lastResults: ['L', 'W', 'D', 'L', 'W'], fifaRanking: 60, continent: "África", description: "Black Stars." },
    "Panamá": { id: "PAN", name: "Panamá", titles: 0, bestResult: "Fase de Grupos", appearances: 2, lastResults: ['W', 'L', 'W', 'D', 'W'], fifaRanking: 41, continent: "Concacaf", description: "Los Canaleros." },
};

export interface GroupMatch {
    id: string;
    group: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamId?: string;
    awayTeamId?: string;
    date: string;
    time: string;
    stadium: string;
    city: string;
    status: 'scheduled' | 'live' | 'finished';
    homeScore?: number;
    awayScore?: number;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
    h2h?: {
        date: string;
        result: string;
        competition: string;
    }[];
    metadata?: any;
}

export const WORLD_CUP_GROUP_MATCHES: GroupMatch[] = [
    // Grupo A - México, Sudáfrica, Corea del Sur, República Checa
    { id: '1489369', group: 'A', homeTeam: 'México', awayTeam: 'Sudáfrica', date: '2026-06-11', time: '19:00', stadium: 'Estadio Azteca', city: 'CDMX', status: 'scheduled' },
    { id: '1538999', group: 'A', homeTeam: 'Corea del Sur', awayTeam: 'República Checa', date: '2026-06-12', time: '02:00', stadium: 'SoFi Stadium', city: 'Los Ángeles', status: 'scheduled' },
    { id: '1489388', group: 'A', homeTeam: 'México', awayTeam: 'Corea del Sur', date: '2026-06-16', time: '20:00', stadium: 'MetLife Stadium', city: 'New Jersey', status: 'scheduled' },
    { id: 'm4', group: 'A', homeTeam: 'Sudáfrica', awayTeam: 'República Checa', date: '2026-06-16', time: '15:00', stadium: 'Levi\'s Stadium', city: 'Santa Clara', status: 'scheduled' },
    { id: '1539010', group: 'A', homeTeam: 'República Checa', awayTeam: 'México', date: '2026-06-21', time: '20:00', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'scheduled' },
    { id: '1489407', group: 'A', homeTeam: 'Sudáfrica', awayTeam: 'Corea del Sur', date: '2026-06-21', time: '15:00', stadium: 'NRG Stadium', city: 'Houston', status: 'scheduled' },

    // Grupo B - Canadá, Bosnia, Qatar, Suiza
    { id: '1539000', group: 'B', homeTeam: 'Canadá', awayTeam: 'Bosnia', date: '2026-06-12', time: '19:00', stadium: 'Lumen Field', city: 'Seattle', status: 'scheduled' },
    { id: '1489373', group: 'B', homeTeam: 'Qatar', awayTeam: 'Suiza', date: '2026-06-13', time: '19:00', stadium: 'Hard Rock Stadium', city: 'Miami', status: 'scheduled' },
    { id: '1489387', group: 'B', homeTeam: 'Canadá', awayTeam: 'Qatar', date: '2026-06-17', time: '20:00', stadium: 'Arrowhead Stadium', city: 'Kansas City', status: 'scheduled' },
    { id: 'm10', group: 'B', homeTeam: 'Bosnia', awayTeam: 'Suiza', date: '2026-06-17', time: '15:00', stadium: 'Gillette Stadium', city: 'Boston', status: 'scheduled' },
    { id: '1489408', group: 'B', homeTeam: 'Suiza', awayTeam: 'Canadá', date: '2026-06-22', time: '20:00', stadium: 'BC Place', city: 'Vancouver', status: 'scheduled' },
    { id: '1539009', group: 'B', homeTeam: 'Bosnia', awayTeam: 'Qatar', date: '2026-06-22', time: '15:00', stadium: 'BMO Field', city: 'Toronto', status: 'scheduled' },

    // Grupo C - Brasil, Marruecos, Haití, Escocia
    { id: '1489371', group: 'C', homeTeam: 'Brasil', awayTeam: 'Marruecos', date: '2026-06-13', time: '22:00', stadium: 'Lincoln Financial Field', city: 'Philadelphia', status: 'scheduled' },
    { id: '1489372', group: 'C', homeTeam: 'Haití', awayTeam: 'Escocia', date: '2026-06-13', time: '15:00', stadium: 'AT&T Stadium', city: 'Dallas', status: 'scheduled' },
    { id: '1489389', group: 'C', homeTeam: 'Brasil', awayTeam: 'Haití', date: '2026-06-18', time: '20:00', stadium: 'Estadio Akron', city: 'Guadalajara', status: 'scheduled' },
    { id: 'm16', group: 'C', homeTeam: 'Marruecos', awayTeam: 'Escocia', date: '2026-06-18', time: '15:00', stadium: 'Estadio BBVA', city: 'Monterrey', status: 'scheduled' },
    { id: '1489406', group: 'C', homeTeam: 'Escocia', awayTeam: 'Brasil', date: '2026-06-23', time: '20:00', stadium: 'Estadio Azteca', city: 'CDMX', status: 'scheduled' },
    { id: '1489405', group: 'C', homeTeam: 'Marruecos', awayTeam: 'Haití', date: '2026-06-23', time: '15:00', stadium: 'SoFi Stadium', city: 'Los Ángeles', status: 'scheduled' },

    // Grupo D - USA, Paraguay, Australia, Turquía
    { id: '1489370', group: 'D', homeTeam: 'USA', awayTeam: 'Paraguay', date: '2026-06-13', time: '01:00', stadium: 'MetLife Stadium', city: 'New Jersey', status: 'scheduled' },
    { id: '1539001', group: 'D', homeTeam: 'Australia', awayTeam: 'Turquía', date: '2026-06-14', time: '15:00', stadium: 'Levi\'s Stadium', city: 'Santa Clara', status: 'scheduled' },
    { id: '1489391', group: 'D', homeTeam: 'USA', awayTeam: 'Australia', date: '2026-06-19', time: '20:00', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'scheduled' },
    { id: 'm22', group: 'D', homeTeam: 'Paraguay', awayTeam: 'Turquía', date: '2026-06-19', time: '15:00', stadium: 'NRG Stadium', city: 'Houston', status: 'scheduled' },
    { id: '1539012', group: 'D', homeTeam: 'Turquía', awayTeam: 'USA', date: '2026-06-24', time: '20:00', stadium: 'Lumen Field', city: 'Seattle', status: 'scheduled' },
    { id: '1489411', group: 'D', homeTeam: 'Paraguay', awayTeam: 'Australia', date: '2026-06-24', time: '15:00', stadium: 'Hard Rock Stadium', city: 'Miami', status: 'scheduled' },

    // Grupo E - Alemania, Curazao, Costa de Marfil, Ecuador
    { id: '1489374', group: 'E', homeTeam: 'Alemania', awayTeam: 'Curazao', date: '2026-06-15', time: '20:00', stadium: 'Arrowhead Stadium', city: 'Kansas City', status: 'scheduled' },
    { id: '1489375', group: 'E', homeTeam: 'Costa de Marfil', awayTeam: 'Ecuador', date: '2026-06-15', time: '15:00', stadium: 'Gillette Stadium', city: 'Boston', status: 'scheduled' },
    { id: '1489393', group: 'E', homeTeam: 'Alemania', awayTeam: 'Costa de Marfil', date: '2026-06-20', time: '20:00', stadium: 'BC Place', city: 'Vancouver', status: 'scheduled' },
    { id: 'm28', group: 'E', homeTeam: 'Curazao', awayTeam: 'Ecuador', date: '2026-06-20', time: '15:00', stadium: 'BMO Field', city: 'Toronto', status: 'scheduled' },
    { id: '1489410', group: 'E', homeTeam: 'Ecuador', awayTeam: 'Alemania', date: '2026-06-25', time: '20:00', stadium: 'Lincoln Financial Field', city: 'Philadelphia', status: 'scheduled' },
    { id: '1489409', group: 'E', homeTeam: 'Curazao', awayTeam: 'Costa de Marfil', date: '2026-06-25', time: '15:00', stadium: 'AT&T Stadium', city: 'Dallas', status: 'scheduled' },

    // Grupo F - Países Bajos, Japón, Suecia, Túnez
    { id: '1489376', group: 'F', homeTeam: 'Países Bajos', awayTeam: 'Japón', date: '2026-06-16', time: '20:00', stadium: 'Estadio Akron', city: 'Guadalajara', status: 'scheduled' },
    { id: '1539002', group: 'F', homeTeam: 'Suecia', awayTeam: 'Túnez', date: '2026-06-16', time: '15:00', stadium: 'Estadio BBVA', city: 'Monterrey', status: 'scheduled' },
    { id: '1539007', group: 'F', homeTeam: 'Países Bajos', awayTeam: 'Suecia', date: '2026-06-21', time: '20:00', stadium: 'Estadio Azteca', city: 'CDMX', status: 'scheduled' },
    { id: 'm34', group: 'F', homeTeam: 'Japón', awayTeam: 'Túnez', date: '2026-06-21', time: '15:00', stadium: 'SoFi Stadium', city: 'Los Ángeles', status: 'scheduled' },
    { id: '1489412', group: 'F', homeTeam: 'Túnez', awayTeam: 'Países Bajos', date: '2026-06-26', time: '20:00', stadium: 'MetLife Stadium', city: 'New Jersey', status: 'scheduled' },
    { id: '1539011', group: 'F', homeTeam: 'Japón', awayTeam: 'Suecia', date: '2026-06-26', time: '15:00', stadium: 'Levi\'s Stadium', city: 'Santa Clara', status: 'scheduled' },

    // Grupo G - Bélgica, Egipto, Irán, Nueva Zelanda
    { id: '1489377', group: 'G', homeTeam: 'Bélgica', awayTeam: 'Egipto', date: '2026-06-17', time: '20:00', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'scheduled' },
    { id: '1489378', group: 'G', homeTeam: 'Irán', awayTeam: 'Nueva Zelanda', date: '2026-06-17', time: '15:00', stadium: 'NRG Stadium', city: 'Houston', status: 'scheduled' },
    { id: '1489395', group: 'G', homeTeam: 'Bélgica', awayTeam: 'Irán', date: '2026-06-22', time: '20:00', stadium: 'Lumen Field', city: 'Seattle', status: 'scheduled' },
    { id: 'm40', group: 'G', homeTeam: 'Egipto', awayTeam: 'Nueva Zelanda', date: '2026-06-22', time: '15:00', stadium: 'Hard Rock Stadium', city: 'Miami', status: 'scheduled' },
    { id: '1489415', group: 'G', homeTeam: 'Nueva Zelanda', awayTeam: 'Bélgica', date: '2026-06-27', time: '20:00', stadium: 'Arrowhead Stadium', city: 'Kansas City', status: 'scheduled' },
    { id: '1489414', group: 'G', homeTeam: 'Egipto', awayTeam: 'Irán', date: '2026-06-27', time: '15:00', stadium: 'Gillette Stadium', city: 'Boston', status: 'scheduled' },

    // Grupo H - España, Cabo Verde, Arabia Saudita, Uruguay
    { id: '1489380', group: 'H', homeTeam: 'España', awayTeam: 'Cabo Verde', date: '2026-06-18', time: '20:00', stadium: 'BC Place', city: 'Vancouver', status: 'scheduled' },
    { id: '1489379', group: 'H', homeTeam: 'Arabia Saudita', awayTeam: 'Uruguay', date: '2026-06-18', time: '15:00', stadium: 'BMO Field', city: 'Toronto', status: 'scheduled' },
    { id: '1489397', group: 'H', homeTeam: 'España', awayTeam: 'Arabia Saudita', date: '2026-06-23', time: '20:00', stadium: 'Lincoln Financial Field', city: 'Philadelphia', status: 'scheduled' },
    { id: 'm46', group: 'H', homeTeam: 'Cabo Verde', awayTeam: 'Uruguay', date: '2026-06-23', time: '15:00', stadium: 'AT&T Stadium', city: 'Dallas', status: 'scheduled' },
    { id: '1489417', group: 'H', homeTeam: 'Uruguay', awayTeam: 'España', date: '2026-06-28', time: '20:00', stadium: 'Estadio Akron', city: 'Guadalajara', status: 'scheduled' },
    { id: '1489413', group: 'H', homeTeam: 'Cabo Verde', awayTeam: 'Arabia Saudita', date: '2026-06-28', time: '15:00', stadium: 'Estadio BBVA', city: 'Monterrey', status: 'scheduled' },

    // Grupo I - Francia, Senegal, Irak, Noruega
    { id: '1489383', group: 'I', homeTeam: 'Francia', awayTeam: 'Senegal', date: '2026-06-19', time: '20:00', stadium: 'Estadio Azteca', city: 'CDMX', status: 'scheduled' },
    { id: '1539016', group: 'I', homeTeam: 'Irak', awayTeam: 'Noruega', date: '2026-06-19', time: '15:00', stadium: 'SoFi Stadium', city: 'Los Ángeles', status: 'scheduled' },
    { id: '1539017', group: 'I', homeTeam: 'Francia', awayTeam: 'Irak', date: '2026-06-24', time: '20:00', stadium: 'MetLife Stadium', city: 'New Jersey', status: 'scheduled' },
    { id: 'm52', group: 'I', homeTeam: 'Senegal', awayTeam: 'Noruega', date: '2026-06-24', time: '15:00', stadium: 'Levi\'s Stadium', city: 'Santa Clara', status: 'scheduled' },
    { id: '1489416', group: 'I', homeTeam: 'Noruega', awayTeam: 'Francia', date: '2026-06-29', time: '20:00', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'scheduled' },
    { id: '1539074', group: 'I', homeTeam: 'Senegal', awayTeam: 'Irak', date: '2026-06-29', time: '15:00', stadium: 'NRG Stadium', city: 'Houston', status: 'scheduled' },

    // Grupo J - Argentina, Argelia, Austria, Jordania
    { id: '1489381', group: 'J', homeTeam: 'Argentina', awayTeam: 'Argelia', date: '2026-06-16', time: '20:00', stadium: 'Lumen Field', city: 'Seattle', status: 'scheduled' },
    { id: '1489382', group: 'J', homeTeam: 'Austria', awayTeam: 'Jordania', date: '2026-06-16', time: '15:00', stadium: 'Hard Rock Stadium', city: 'Miami', status: 'scheduled' },
    { id: '1489399', group: 'J', homeTeam: 'Argentina', awayTeam: 'Austria', date: '2026-06-22', time: '20:00', stadium: 'Arrowhead Stadium', city: 'Kansas City', status: 'scheduled' },
    { id: 'm58', group: 'J', homeTeam: 'Argelia', awayTeam: 'Jordania', date: '2026-06-22', time: '15:00', stadium: 'Gillette Stadium', city: 'Boston', status: 'scheduled' },
    { id: '1489421', group: 'J', homeTeam: 'Jordania', awayTeam: 'Argentina', date: '2026-06-27', time: '20:00', stadium: 'BC Place', city: 'Vancouver', status: 'scheduled' },
    { id: '1489418', group: 'J', homeTeam: 'Argelia', awayTeam: 'Austria', date: '2026-06-27', time: '15:00', stadium: 'BMO Field', city: 'Toronto', status: 'scheduled' },

    // Grupo K - Portugal, RD Congo, Uzbekistán, Colombia
    { id: '1539003', group: 'K', homeTeam: 'Portugal', awayTeam: 'RD Congo', date: '2026-06-21', time: '20:00', stadium: 'Lincoln Financial Field', city: 'Philadelphia', status: 'scheduled' },
    { id: '1489386', group: 'K', homeTeam: 'Uzbekistán', awayTeam: 'Colombia', date: '2026-06-21', time: '15:00', stadium: 'AT&T Stadium', city: 'Dallas', status: 'scheduled' },
    { id: '1489404', group: 'K', homeTeam: 'Portugal', awayTeam: 'Uzbekistán', date: '2026-06-26', time: '20:00', stadium: 'Estadio Akron', city: 'Guadalajara', status: 'scheduled' },
    { id: 'm64', group: 'K', homeTeam: 'RD Congo', awayTeam: 'Colombia', date: '2026-06-26', time: '15:00', stadium: 'Estadio BBVA', city: 'Monterrey', status: 'scheduled' },
    { id: '1489419', group: 'K', homeTeam: 'Colombia', awayTeam: 'Portugal', date: '2026-07-01', time: '20:00', stadium: 'Estadio Azteca', city: 'CDMX', status: 'scheduled' },
    { id: '1539013', group: 'K', homeTeam: 'RD Congo', awayTeam: 'Uzbekistán', date: '2026-07-01', time: '15:00', stadium: 'SoFi Stadium', city: 'Los Ángeles', status: 'scheduled' },

    // Grupo L - Inglaterra, Croacia, Ghana, Panamá
    { id: '1489384', group: 'L', homeTeam: 'Inglaterra', awayTeam: 'Croacia', date: '2026-06-22', time: '20:00', stadium: 'MetLife Stadium', city: 'New Jersey', status: 'scheduled' },
    { id: '1489385', group: 'L', homeTeam: 'Ghana', awayTeam: 'Panamá', date: '2026-06-22', time: '15:00', stadium: 'Levi\'s Stadium', city: 'Santa Clara', status: 'scheduled' },
    { id: '1489402', group: 'L', homeTeam: 'Inglaterra', awayTeam: 'Ghana', date: '2026-06-27', time: '20:00', stadium: 'Mercedes-Benz Stadium', city: 'Atlanta', status: 'scheduled' },
    { id: 'm70', group: 'L', homeTeam: 'Croacia', awayTeam: 'Panamá', date: '2026-06-27', time: '15:00', stadium: 'NRG Stadium', city: 'Houston', status: 'scheduled' },
    { id: '1489422', group: 'L', homeTeam: 'Panamá', awayTeam: 'Inglaterra', date: '2026-07-02', time: '20:00', stadium: 'Lumen Field', city: 'Seattle', status: 'scheduled' },
    { id: '1489420', group: 'L', homeTeam: 'Croacia', awayTeam: 'Ghana', date: '2026-07-02', time: '15:00', stadium: 'Hard Rock Stadium', city: 'Miami', status: 'scheduled' },
];

export const getGroupMatches = (groupLetter: string): GroupMatch[] => {
    return WORLD_CUP_GROUP_MATCHES.filter(m => m.group === groupLetter);
};

export const getTeamFlagUrl = (teamIdOrName: string): string => {
    if (!teamIdOrName) return 'https://media.api-sports.io/football/teams/unknown.png';
    const key = teamIdOrName.trim();
    const flagMap: Record<string, string> = {
        "Argentina": "ar", "ARG": "ar",
        "México": "mx", "Mexico": "mx", "MEX": "mx",
        "Brasil": "br", "Brazil": "br", "BRA": "br",
        "España": "es", "Spain": "es", "ESP": "es", "SPA": "es",
        "USA": "us",
        "Canadá": "ca", "Canada": "ca", "CAN": "ca",
        "Francia": "fr", "France": "fr", "FRA": "fr",
        "Alemania": "de", "Germany": "de", "GER": "de",
        "Corea del Sur": "kr", "South Korea": "kr", "KOR": "kr",
        "República Checa": "cz", "Czech Republic": "cz", "CZE": "cz",
        "Sudáfrica": "za", "South Africa": "za", "RSA": "za", "SOU": "za",
        "Australia": "au", "AUS": "au",
        "Arabia Saudita": "sa", "Saudi Arabia": "sa", "KSA": "sa", "SAU": "sa",
        "Bosnia": "ba", "Bosnia & Herzegovina": "ba", "BIH": "ba", "BOS": "ba",
        "Qatar": "qa", "QAT": "qa",
        "Suiza": "ch", "Switzerland": "ch", "SUI": "ch", "SWI": "ch",
        "Haití": "ht", "Haiti": "ht", "HAI": "ht",
        "Marruecos": "ma", "Morocco": "ma", "MAR": "ma", "MOR": "ma",
        "Escocia": "gb-sct", "Scotland": "gb-sct", "SCO": "gb-sct",
        "Paraguay": "py", "PAR": "py",
        "Turquía": "tr", "Turkey": "tr", "Türkiye": "tr", "TUR": "tr",
        "Curazao": "cw", "Curaçao": "cw", "CUW": "cw", "CUR": "cw",
        "Ecuador": "ec", "ECU": "ec",
        "Costa de Marfil": "ci", "Ivory Coast": "ci", "CIV": "ci", "IVO": "ci",
        "Países Bajos": "nl", "Netherlands": "nl", "NED": "nl", "NET": "nl",
        "Japón": "jp", "Japan": "jp", "JPN": "jp", "JAP": "jp",
        "Suecia": "se", "Sweden": "se", "SWE": "se",
        "Túnez": "tn", "Tunisia": "tn", "TUN": "tn",
        "Bélgica": "be", "Belgium": "be", "BEL": "be",
        "Egipto": "eg", "Egypt": "eg", "EGY": "eg",
        "Irán": "ir", "Iran": "ir", "IRN": "ir", "IRA": "ir",
        "Nueva Zelanda": "nz", "New Zealand": "nz", "NZL": "nz", "ZEA": "nz",
        "Cabo Verde": "cv", "Cape Verde Islands": "cv", "CPV": "cv", "CAP": "cv",
        "Uruguay": "uy", "URU": "uy",
        "Noruega": "no", "Norway": "no", "NOR": "no",
        "Senegal": "sn", "SEN": "sn",
        "Irak": "iq", "Iraq": "iq", "IRQ": "iq",
        "Argelia": "dz", "Algeria": "dz", "ALG": "dz",
        "Austria": "at", "AUT": "at",
        "Jordania": "jo", "Jordan": "jo", "JOR": "jo",
        "Portugal": "pt", "POR": "pt",
        "RD Congo": "cd", "Congo DR": "cd", "COD": "cd", "CON": "cd",
        "Uzbekistán": "uz", "Uzbekistan": "uz", "UZB": "uz",
        "Colombia": "co", "COL": "co",
        "Inglaterra": "gb-eng", "England": "gb-eng", "ENG": "gb-eng",
        "Croacia": "hr", "Croatia": "hr", "CRO": "hr",
        "Ghana": "gh", "GHA": "gh",
        "Panamá": "pa", "Panama": "pa", "PAN": "pa",
        "Dinamarca": "dk", "Danimarca": "dk",
        "Grecia": "gr", "Italia": "it", "Chile": "cl", "Nigeria": "ng"
    };

    // Try direct match
    if (flagMap[key]) return `https://flagcdn.com/${flagMap[key]}.svg`;
    
    // Try uppercase match
    const upperKey = key.toUpperCase();
    if (flagMap[upperKey]) return `https://flagcdn.com/${flagMap[upperKey]}.svg`;
    
    // Try substring matching for fuzzy names
    for (const [name, code] of Object.entries(flagMap)) {
        if (key.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(key.toLowerCase())) {
            return `https://flagcdn.com/${code}.svg`;
        }
    }
    
    return 'https://media.api-sports.io/football/teams/unknown.png';
};

export const getTeamMatches = (teamName: string): GroupMatch[] => {
    return WORLD_CUP_GROUP_MATCHES.filter(m => m.homeTeam === teamName || m.awayTeam === teamName);
};

export const getGroupStandings = (letter: string, predictions: any[] = [], realMatches: any[] = []) => {
    const matches = getGroupMatches(letter);
    const teams = Array.from(new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam])));

    if (teams.length === 0) return [];

    const standings = teams.map((teamName) => {
        const stats = {
            id: `${letter}-${teamName}`,
            name: teamName,
            flag: getTeamFlagUrl(teamName),
            pj: 0,
            gf: 0,
            gc: 0,
            dg: 0,
            pts: 0,
            form: [] as ('W'|'D'|'L')[]
        };

        // Calculate stats from predictions or real matches
        matches.forEach(m => {
            const isHome = m.homeTeam === teamName;
            const isAway = m.awayTeam === teamName;
            if (!isHome && !isAway) return;

            // Try to find a real match result first
            const realMatch = realMatches.find(rm => rm.id === m.id || rm.api_id === m.id || (rm.home_team === m.homeTeam && rm.away_team === m.awayTeam));
            const pred = predictions.find(p => p.matchId === m.id);

            let hScore: number | undefined;
            let aScore: number | undefined;

            if (realMatch && (realMatch.status === 'FINISHED' || realMatch.status === 'finished')) {
                // Use real score (support both snake_case from DB and camelCase from matchService)
                hScore = realMatch.home_score ?? realMatch.homeScore ?? 0;
                aScore = realMatch.away_score ?? realMatch.awayScore ?? 0;

                // Fallback to events if score is 0-0 but goals exist in metadata
                const events = realMatch.metadata?.events || [];
                if (hScore === 0 && aScore === 0 && events.length > 0) {
                    const homeId = realMatch.homeTeamId || realMatch.home_team_id;
                    const awayId = realMatch.awayTeamId || realMatch.away_team_id;
                    const eventHomeGoals = events.filter((e: any) => e.type === 'GOAL' && (e.teamId === homeId || e.teamId === realMatch.homeTeam || e.teamName === realMatch.homeTeam)).length;
                    const eventAwayGoals = events.filter((e: any) => e.type === 'GOAL' && (e.teamId === awayId || e.teamId === realMatch.awayTeam || e.teamName === realMatch.awayTeam)).length;
                    
                    if (eventHomeGoals > 0 || eventAwayGoals > 0) {
                        hScore = eventHomeGoals;
                        aScore = eventAwayGoals;
                    }
                }
            } else if (pred && pred.exactScore) {
                // Fallback to user prediction
                hScore = pred.exactScore.home;
                aScore = pred.exactScore.away;
            }

            if (hScore === undefined || aScore === undefined || hScore === null || aScore === null) return;

            stats.pj += 1;
            if (isHome) {
                stats.gf += hScore;
                stats.gc += aScore;
                if (hScore > aScore) { stats.pts += 3; stats.form.push('W'); }
                else if (hScore === aScore) { stats.pts += 1; stats.form.push('D'); }
                else { stats.form.push('L'); }
            } else if (isAway) {
                stats.gf += aScore;
                stats.gc += hScore;
                if (aScore > hScore) { stats.pts += 3; stats.form.push('W'); }
                else if (aScore === hScore) { stats.pts += 1; stats.form.push('D'); }
                else { stats.form.push('L'); }
            }
        });

        stats.dg = stats.gf - stats.gc;
        return stats;
    });

    // Sort by Pts, then DG, then GF (simplified FIFA rules)
    return standings.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
};

export const getTeamStaticData = (teamName: string): TeamHistory | null => {
    return WORLD_CUP_TEAMS_HISTORY[teamName] || null;
};

export const WORLD_CUP_VENUES: Venue[] = [
    // México
    {
        id: "v-cdmx", name: "Estadio Azteca", city: "Ciudad de México", country: "México", capacity: 83264,
        image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop",
        description: "El Coloso de Santa Úrsula hará historia pura: será el primer estadio en la historia en albergar encuentros de tres Copas Mundiales de la FIFA distintas (1970, 1986 y 2026), incluyendo el partido inaugural de este torneo.",
        website: "https://www.estadioazteca.com.mx/"
    },

    {
        id: "v-gdl", name: "Estadio Akron", city: "Guadalajara", country: "México", capacity: 48000,
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop",
        description: "Diseñado con una forma espectacular de volcán y una cubierta que simula una nube, es considerado uno de los estadios más modernos y ecológicamente amigables de toda América Latina.",
        website: "https://estadioakron.mx/"
    },

    {
        id: "v-mty", name: "Estadio BBVA", city: "Monterrey", country: "México", capacity: 53500,
        image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop",
        description: "Conocido popularmente como 'El Gigante de Acero', este vanguardista estadio ofrece a los aficionados unas vistas panorámicas inigualables y majestuosas del icónico Cerro de la Silla desde sus tribunas.",
        website: "https://estadio-bbva.mx//"
    },


    // Canadá
    {
        id: "v-van", name: "BC Place", city: "Vancouver", country: "Canadá", capacity: 54500,
        image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=2000&auto=format&fit=crop",
        description: "Famoso mundialmente por haber sido la sede principal de los Juegos Olímpicos de Invierno de 2010. Cuenta con un innovador techo retráctil sustentado por una inmensa red de cables y una gigantesca pantalla central.",
        website: "https://www.bcplace.com/"
    },

    {
        id: "v-tor", name: "BMO Field", city: "Toronto", country: "Canadá", capacity: 45000,
        image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=2000&auto=format&fit=crop",
        description: "La fortaleza de la Selección Nacional de Canadá. Originalmente construido para el fútbol, el estadio será significativamente ampliado temporalmente para cumplir con las exigencias de aforo de la FIFA.",
        website: "https://www.bmofield.com/"
    },


    // USA
    {
        id: "v-nyj", name: "MetLife Stadium", city: "NYC / Nueva Jersey", country: "USA", capacity: 82500,
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop",
        description: "El escenario elegido para la Gran Final del Mundial 2026. Ubicado en el corazón del área metropolitana neoyorquina, este monumental recinto ya albergó la gran final de la Copa América Centenario 2016.",
        website: "https://www.metlifestadium.com/"
    },

    {
        id: "v-dal", name: "AT&T Stadium", city: "Dallas", country: "USA", capacity: 80000,
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop",
        description: "Uno de los recintos cubiertos más colosales del mundo, apodado cariñosamente 'Jerry World'. Su característica principal es la gigantesca pantalla de video de altísima definición suspendida sobre el campo de juego.",
        website: "https://attstadium.com/"
    },

    {
        id: "v-la", name: "SoFi Stadium", city: "Los Ángeles", country: "USA", capacity: 70240,
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop",
        description: "Una auténtica obra maestra de la arquitectura e ingeniería contemporánea. Destaca por su techo translúcido y la revolucionaria pantalla 'Infinity Screen' ovalada de doble cara que ofrece repeticiones en 4K.",
        website: "https://www.sofistadium.com/"
    },

    {
        id: "v-atl", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000,
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop",
        description: "Una maravilla del diseño, célebre por su techo retráctil automatizado compuesto por ocho inmensos paneles triangulares de cristal que se abren y cierran asemejando el diafragma de una cámara fotográfica.",
        website: "https://mercedesbenzstadium.com/"
    },

    {
        id: "v-hou", name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72220,
        image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop",
        description: "Fue el primer estadio de toda la historia de la NFL en contar con un moderno techo retráctil. Es un recito sumamente versátil, brindando una climatización óptima sin importar el fuerte calor veraniego de Texas.",
        website: "https://www.nrgpark.com/"
    },

    {
        id: "v-phi", name: "Lincoln Financial Field", city: "Filadelfia", country: "USA", capacity: 69796,
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop",
        description: "La joya deportiva de la ciudad del amor fraternal. Un estadio donde reverbera la historia, situado en la misma metrópolis en donde los padres fundadores firmaron la histórica Declaración de Independencia.",
        website: "https://www.lincolnfinancialfield.com/"
    },

    {
        id: "v-sea", name: "Lumen Field", city: "Seattle", country: "USA", capacity: 69000,
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=2000&auto=format&fit=crop",
        description: "Mundialmente temido y respetado por ser uno de los ambientes más ruidosos del deporte gracias a su apasionada afición. Su icónico diseño en forma de herradura captura el estruendo maravillosamente.",
        website: "https://www.lumenfield.com/"
    },

    {
        id: "v-sf", name: "Levi's Stadium", city: "Área de la Bahía (SF)", country: "USA", capacity: 68500,
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop",
        description: "La joya de Silicon Valley. Pionero global al priorizar la sustentabilidad medioambiental y ofrecer una infraestructura tecnológica líder en el mundo con conectividad de alta velocidad a lo largo de todo el estadio.",
        website: "https://www.levisstadium.com/"
    },

    {
        id: "v-bos", name: "Gillette Stadium", city: "Boston", country: "USA", capacity: 65878,
        image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop",
        description: "Hogar de un sólido legado de triunfos y de una rica tradición futbolística en Nueva Inglaterra. Es famoso por su icónico puente y faro ubicados justo en una de las cabeceras del campo de juego.",
        website: "https://www.gillettestadium.com/"
    },
    {
        id: "v-mia", name: "Hard Rock Stadium", city: "Miami", country: "USA", capacity: 64767,
        image: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=2000&auto=format&fit=crop",
        description: "Recientemente renovado para brindar una experiencia de lujo, el recinto brilla con un elegante e innovador techo cuadrado concebido a cielo abierto que provee de sombra al 90% de los espectadores ante el sol de la Florida.",
        website: "https://www.hardrockstadium.com/"
    },

    {
        id: "v-kc", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416,
        image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=2000&auto=format&fit=crop",
        description: "Ubicado en el auténtico corazón del país norteamericano. Es famoso porque ostenta el asombroso récord mundial Guinness de la ovación más ruidosa registrada en un estadio presencial deportivo al aire libre.",
        website: "https://www.chiefs.com/stadium/"
    }

];

export const getVenues = (): Venue[] => WORLD_CUP_VENUES;

