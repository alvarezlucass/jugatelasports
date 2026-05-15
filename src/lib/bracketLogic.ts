export interface TeamStanding {
    id: string;
    name: string;
    flag: string;
    pj: number;
    gf: number;
    gc: number;
    dg: number;
    pts: number;
    groupId?: string; // e.g. 'A', 'B'
    rank?: number; // 1, 2, 3, 4
}

export type AdvanceMethod = 'REGULAR' | 'EXTRA' | 'PENALTIES';

export interface MatchupNode {
    id: string;
    team1?: { name: string; flag: string; source: string; originalId?: string; selected?: boolean };
    team2?: { name: string; flag: string; source: string; originalId?: string; selected?: boolean };
    winnerId?: string;
    advanceMethod?: AdvanceMethod;
    homeScore?: number;
    awayScore?: number;
    nextMatchId?: string;
}

/**
 * Given the standings for 12 groups (A-L), determine the advancing teams.
 * 24 teams from 1st and 2nd places.
 * 8 best 3rd placed teams.
 */
export const calculateAdvancingTeams = (groupsStandings: Record<string, TeamStanding[]>) => {
    const list1st: TeamStanding[] = [];
    const list2nd: TeamStanding[] = [];
    let list3rd: TeamStanding[] = [];

    const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    groupLetters.forEach(letter => {
        const standings = groupsStandings[letter];
        if (!standings || standings.length === 0) return;

        // Ordenar por pts, luego dg, luego gf (reglas FIFA estándar)
        const sorted = [...standings].sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
        
        if (sorted[0]) list1st.push({ ...sorted[0], groupId: letter, rank: 1 });
        if (sorted[1]) list2nd.push({ ...sorted[1], groupId: letter, rank: 2 });
        if (sorted[2]) list3rd.push({ ...sorted[2], groupId: letter, rank: 3 });
    });

    // Ordenar los 3ros lugares para obtener los 8 mejores
    list3rd = list3rd.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);
    const top8Thirds = list3rd.slice(0, 8);

    return {
        first: list1st,
        second: list2nd,
        thirds: top8Thirds
    };
};

/**
 * Generate Round of 32 baseline
 * 16 Matches. 
 * Since true 3rd place mappings are extremely complex (495 permutations),
 * we use a simplified deterministic pairing for the demo.
 */
export const generateInitialBracket = (advancingTeams: { first: TeamStanding[], second: TeamStanding[], thirds: TeamStanding[] }, forcePlaceholders: boolean = false): MatchupNode[] => {
    const { first, second, thirds } = advancingTeams;
    
    // We have 12 firsts, 12 seconds, 8 thirds. Total 32.
    // Let's pair them in 16 matches.
    // To ensure a full bracket, if we don't have enough teams yet (e.g. data missing), we fallback to placeholders.
    const createPlaceholder = (source: string) => ({ name: 'Por Definir', flag: '', source, selected: false });

    const getTeamFromList = (list: TeamStanding[], idx: number, source: string) => {
        if (forcePlaceholders) return createPlaceholder(source);
        const t = list[idx];
        if (t) return { name: t.name, flag: t.flag, source, originalId: t.id, selected: false };
        return createPlaceholder(source);
    };

    const matches: MatchupNode[] = [];

    // Matches 1-4: 1sts vs 3rds
    matches.push({ id: 'R32_1', team1: getTeamFromList(first, 0, '1ro Grupo A'), team2: getTeamFromList(thirds, 0, 'Mejor 3ro (1)') });
    matches.push({ id: 'R32_2', team1: getTeamFromList(second, 0, '2do Grupo B'), team2: getTeamFromList(second, 1, '2do Grupo C') });
    
    matches.push({ id: 'R32_3', team1: getTeamFromList(first, 1, '1ro Grupo D'), team2: getTeamFromList(thirds, 1, 'Mejor 3ro (2)') });
    matches.push({ id: 'R32_4', team1: getTeamFromList(second, 2, '2do Grupo E'), team2: getTeamFromList(second, 3, '2do Grupo F') });

    matches.push({ id: 'R32_5', team1: getTeamFromList(first, 2, '1ro Grupo G'), team2: getTeamFromList(thirds, 2, 'Mejor 3ro (3)') });
    matches.push({ id: 'R32_6', team1: getTeamFromList(second, 4, '2do Grupo H'), team2: getTeamFromList(second, 5, '2do Grupo I') });

    matches.push({ id: 'R32_7', team1: getTeamFromList(first, 3, '1ro Grupo J'), team2: getTeamFromList(thirds, 3, 'Mejor 3ro (4)') });
    matches.push({ id: 'R32_8', team1: getTeamFromList(second, 6, '2do Grupo K'), team2: getTeamFromList(second, 7, '2do Grupo L') });

    matches.push({ id: 'R32_9', team1: getTeamFromList(first, 4, '1ro Grupo B'), team2: getTeamFromList(thirds, 4, 'Mejor 3ro (5)') });
    matches.push({ id: 'R32_10', team1: getTeamFromList(first, 5, '1ro Grupo C'), team2: getTeamFromList(first, 6, '1ro Grupo E') }); // 1v1 to balance 12 groups

    matches.push({ id: 'R32_11', team1: getTeamFromList(first, 7, '1ro Grupo F'), team2: getTeamFromList(thirds, 5, 'Mejor 3ro (6)') });
    matches.push({ id: 'R32_12', team1: getTeamFromList(second, 8, '2do Grupo A'), team2: getTeamFromList(second, 9, '2do Grupo D') });

    matches.push({ id: 'R32_13', team1: getTeamFromList(first, 8, '1ro Grupo H'), team2: getTeamFromList(thirds, 6, 'Mejor 3ro (7)') });
    matches.push({ id: 'R32_14', team1: getTeamFromList(first, 9, '1ro Grupo I'), team2: getTeamFromList(first, 10, '1ro Grupo K') }); // 1v1

    matches.push({ id: 'R32_15', team1: getTeamFromList(first, 11, '1ro Grupo L'), team2: getTeamFromList(thirds, 7, 'Mejor 3ro (8)') });
    matches.push({ id: 'R32_16', team1: getTeamFromList(second, 10, '2do Grupo G'), team2: getTeamFromList(second, 11, '2do Grupo J') });

    return matches;
};

export const generateEmptyBracketTree = () => {
    // 16 -> 8 -> 4 -> 2 -> 1 matches
    const createEmptyMatch = (id: string, s1: string, s2: string): MatchupNode => ({
        id, 
        team1: { name: 'Por Definir', flag: '', source: s1, selected: false }, 
        team2: { name: 'Por Definir', flag: '', source: s2, selected: false }
    });

    return {
        r32: Array.from({length: 16}, (_, i) => createEmptyMatch(`R32_${i+1}`, `Llave ${i+1}A`, `Llave ${i+1}B`)),
        r16: Array.from({length: 8}, (_, i) => createEmptyMatch(`R16_${i+1}`, `Ganador R32-${i*2+1}`, `Ganador R32-${i*2+2}`)),
        r8: Array.from({length: 4}, (_, i) => createEmptyMatch(`R8_${i+1}`, `Ganador Octavos ${i*2+1}`, `Ganador Octavos ${i*2+2}`)),
        r4: Array.from({length: 2}, (_, i) => createEmptyMatch(`R4_${i+1}`, `Ganador Cuartos ${i*2+1}`, `Ganador Cuartos ${i*2+2}`)),
        final: [createEmptyMatch('FINAL', 'Ganador Semifinal 1', 'Ganador Semifinal 2')],
        thirdPlace: [createEmptyMatch('THIRD_PLACE', 'Perdedor Semifinal 1', 'Perdedor Semifinal 2')]
    };
};

export const generateDemoBracketTree = () => {
    const empty = generateEmptyBracketTree();
    const mockTeams = [
        { name: 'México', flag: 'https://flagcdn.com/mx.svg' },
        { name: 'Sudáfrica', flag: 'https://flagcdn.com/za.svg' },
        { name: 'Brasil', flag: 'https://flagcdn.com/br.svg' },
        { name: 'Marruecos', flag: 'https://flagcdn.com/ma.svg' },
        { name: 'España', flag: 'https://flagcdn.com/es.svg' },
        { name: 'Uruguay', flag: 'https://flagcdn.com/uy.svg' },
        { name: 'Argentina', flag: 'https://flagcdn.com/ar.svg' },
        { name: 'Alemania', flag: 'https://flagcdn.com/de.svg' },
        { name: 'Francia', flag: 'https://flagcdn.com/fr.svg' },
        { name: 'Inglaterra', flag: 'https://flagcdn.com/gb-eng.svg' },
        { name: 'USA', flag: 'https://flagcdn.com/us.svg' },
        { name: 'Países Bajos', flag: 'https://flagcdn.com/nl.svg' },
        { name: 'Portugal', flag: 'https://flagcdn.com/pt.svg' },
        { name: 'Bélgica', flag: 'https://flagcdn.com/be.svg' },
        { name: 'Colombia', flag: 'https://flagcdn.com/co.svg' },
        { name: 'Japón', flag: 'https://flagcdn.com/jp.svg' },
        { name: 'Croacia', flag: 'https://flagcdn.com/hr.svg' },
        { name: 'Ecuador', flag: 'https://flagcdn.com/ec.svg' },
        { name: 'Senegal', flag: 'https://flagcdn.com/sn.svg' },
        { name: 'Suiza', flag: 'https://flagcdn.com/ch.svg' },
        { name: 'Canadá', flag: 'https://flagcdn.com/ca.svg' },
        { name: 'Australia', flag: 'https://flagcdn.com/au.svg' },
        { name: 'Marruecos', flag: 'https://flagcdn.com/ma.svg' },
        { name: 'Corea del Sur', flag: 'https://flagcdn.com/kr.svg' },
        { name: 'Danimarca', flag: 'https://flagcdn.com/dk.svg' },
        { name: 'Turquía', flag: 'https://flagcdn.com/tr.svg' },
        { name: 'Noruega', flag: 'https://flagcdn.com/no.svg' },
        { name: 'Argelia', flag: 'https://flagcdn.com/dz.svg' },
        { name: 'Grecia', flag: 'https://flagcdn.com/gr.svg' },
        { name: 'Italia', flag: 'https://flagcdn.com/it.svg' },
        { name: 'Chile', flag: 'https://flagcdn.com/cl.svg' },
        { name: 'Nigeria', flag: 'https://flagcdn.com/ng.svg' },
    ];

    // Populate R32 with these teams
    empty.r32.forEach((match, i) => {
        match.team1 = { ...mockTeams[i*2], source: 'Clasificado' };
        match.team2 = { ...mockTeams[i*2+1], source: 'Clasificado' };
    });

    return empty;
};

export type SimulationPersona = 'IA' | 'Contra' | 'Loco';

/**
 * Simulates a winner and score for a match based on a persona.
 */
export const simulateMatch = (match: MatchupNode, persona: SimulationPersona) => {
    let winnerId: string | undefined;
    let homeScore = 0;
    let awayScore = 0;
    const team1Name = match.team1?.name || '';
    const team2Name = match.team2?.name || '';

    if (persona === 'IA') {
        // IA is balanced, favors team 1 slightly or higher seeds if we had them
        const bias = Math.random();
        if (bias > 0.48) {
            winnerId = team1Name;
            homeScore = Math.floor(Math.random() * 3) + 1;
            awayScore = Math.floor(Math.random() * homeScore);
        } else {
            winnerId = team2Name;
            awayScore = Math.floor(Math.random() * 3) + 1;
            homeScore = Math.floor(Math.random() * awayScore);
        }
    } else if (persona === 'Contra') {
        // Contra picks the underdog (visitor team usually) 
        const bias = Math.random();
        if (bias > 0.75) {
            winnerId = team1Name;
            homeScore = Math.floor(Math.random() * 2) + 1;
            awayScore = Math.floor(Math.random() * homeScore);
        } else {
            winnerId = team2Name;
            awayScore = Math.floor(Math.random() * 4) + 1;
            homeScore = Math.floor(Math.random() * awayScore);
        }
    } else if (persona === 'Loco') {
        // Loco is "Passionate/Chaos" - higher scores, more high-stakes feel
        const bias = Math.random();
        if (bias > 0.5) {
            winnerId = team1Name;
            homeScore = Math.floor(Math.random() * 5) + 2;
            awayScore = Math.floor(Math.random() * (homeScore - 1));
        } else {
            winnerId = team2Name;
            awayScore = Math.floor(Math.random() * 5) + 2;
            homeScore = Math.floor(Math.random() * (awayScore - 1));
        }
    }

    return { winnerId, homeScore, awayScore, advanceMethod: (Math.random() > 0.8 ? 'PENALTIES' : 'REGULAR') as AdvanceMethod };
};

/**
 * Simulates the entire bracket progression.
 */
export const simulateFullBracket = (currentBracket: any, persona: SimulationPersona) => {
    const newBracket = JSON.parse(JSON.stringify(currentBracket));
    const rounds = ['r32', 'r16', 'r8', 'r4', 'final'];

    rounds.forEach((rk, idx) => {
        const matches = newBracket[rk] || [];
        matches.forEach((match: MatchupNode, mi: number) => {
            // Only simulate if teams are set
            if (match.team1?.name && match.team1.name !== 'Por Definir' && match.team2?.name && match.team2.name !== 'Por Definir') {
                const result = simulateMatch(match, persona);
                match.winnerId = result.winnerId;
                match.homeScore = result.homeScore;
                match.awayScore = result.awayScore;
                match.advanceMethod = result.advanceMethod;

                // Propagate to next round
                const nextRk = rounds[idx + 1];
                if (nextRk) {
                    const nmi = Math.floor(mi / 2);
                    const slot = mi % 2 === 0 ? 'team1' : 'team2';
                    const winnerObj = result.winnerId === match.team1?.name ? match.team1 : match.team2;
                    
                    if (newBracket[nextRk][nmi]) {
                        newBracket[nextRk][nmi][slot] = { ...winnerObj, source: `Ganador ${match.id}`, selected: false };
                    }
                }

                // Handle losers for third place if it's the semifinal (r4)
                if (rk === 'r4' && newBracket.thirdPlace?.[0]) {
                    const loserObj = result.winnerId === match.team1?.name ? match.team2 : match.team1;
                    const slot = mi % 2 === 0 ? 'team1' : 'team2';
                    newBracket.thirdPlace[0][slot] = { ...loserObj, source: `Perdedor ${match.id}`, selected: false };
                }
            }
        });
    });

    // Finalize Third Place
    if (newBracket.thirdPlace?.[0]) {
        const tp = newBracket.thirdPlace[0];
        if (tp.team1?.name && tp.team1.name !== 'Por Definir' && tp.team2?.name && tp.team2.name !== 'Por Definir') {
            const res = simulateMatch(tp, persona);
            tp.winnerId = res.winnerId;
            tp.homeScore = res.homeScore;
            tp.awayScore = res.awayScore;
        }
    }

    return newBracket;
};
