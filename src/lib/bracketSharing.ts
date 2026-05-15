import { type MatchupNode } from './bracketLogic';

/**
 * Compact representation of a match prediction:
 * - winner: 0 (none), 1 (team1), 2 (team2)
 * - method: 0 (REGULAR), 1 (EXTRA), 2 (PENALTIES)
 */
export const serializeBracket = (state: Record<string, MatchupNode[]>): string => {
    try {
        const rounds = ['r32', 'r16', 'r8', 'r4', 'final', 'thirdPlace'];
        const data: any = {};
        
        rounds.forEach(round => {
            const matches = state[round] || [];
            data[round] = matches.map(m => {
                let winner = 0;
                if (m.winnerId === m.team1?.name && m.team1?.name !== 'Por Definir') winner = 1;
                else if (m.winnerId === m.team2?.name && m.team2?.name !== 'Por Definir') winner = 2;
                
                let method = 0;
                if (m.advanceMethod === 'EXTRA') method = 1;
                else if (m.advanceMethod === 'PENALTIES') method = 2;
                
                return { w: winner, m: method };
            });
        });
        
        // Also capture the r32 team names ONLY if they are NOT placeholders,
        // because the rest of the bracket is derived from them.
        data.teams = (state.r32 || []).map(m => ({
            t1: m.team1?.name || 'Por Definir',
            f1: m.team1?.flag || '',
            t2: m.team2?.name || 'Por Definir',
            f2: m.team2?.flag || ''
        }));

        const json = JSON.stringify(data);
        return btoa(unescape(encodeURIComponent(json)));
    } catch (e) {
        console.error('Failure serializing bracket:', e);
        return '';
    }
};

export const deserializeBracket = (encoded: string): Record<string, MatchupNode[]> | null => {
    try {
        if (!encoded) return null;
        const json = decodeURIComponent(escape(atob(encoded)));
        const data = JSON.parse(json);
        
        if (!data || !data.r32 || !data.teams) {
            console.error('Invalid bracket data structure', data);
            return null;
        }

        // Rebuild a clean bracket from the base teams
        const state: any = {
            r32: data.r32.map((m: any, i: number) => {
                const base = data.teams[i] || { t1: 'Por Definir', f1: '', t2: 'Por Definir', f2: '' };
                return {
                    id: `R32_${i+1}`,
                    team1: { name: base.t1, flag: base.f1, source: 'Clasificado', selected: m.w === 1 },
                    team2: { name: base.t2, flag: base.f2, source: 'Clasificado', selected: m.w === 2 },
                    winnerId: m.w === 1 ? base.t1 : (m.w === 2 ? base.t2 : undefined),
                    advanceMethod: (m.m === 1 ? 'EXTRA' : (m.m === 2 ? 'PENALTIES' : 'REGULAR')) as any
                };
            })
        };

        const rounds = ['r16', 'r8', 'r4', 'final', 'thirdPlace'];
        rounds.forEach(rk => {
            if (!data[rk]) {
                state[rk] = []; 
                return;
            }
            state[rk] = data[rk].map((m: any, i: number) => {
                return {
                    id: `${rk.toUpperCase()}_${i+1}`,
                    winnerId: undefined, 
                    advanceMethod: m.m === 1 ? 'EXTRA' : (m.m === 2 ? 'PENALTIES' : 'REGULAR'),
                    _w: m.w 
                };
            });
        });

        return state;
    } catch (e) {
        console.error('Failure deserializing bracket:', e);
        return null;
    }
};
