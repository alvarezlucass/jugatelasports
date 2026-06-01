import { supabase } from '../lib/supabase';
import { type GroupMatch } from '../data/worldCupPersistence';

export const matchService = {
    async getMatches(leagueId?: string, options?: { upcomingOnly?: boolean; daysLimit?: number; season?: number }): Promise<GroupMatch[]> {
        let query = supabase
            .from('matches')
            .select('*')
            .order('start_time', { ascending: true });

        if (leagueId) {
            // league_id in DB uses dbId strings (e.g., 'lpf', 'ucl', 'world-cup-2026')
            query = query.eq('league_id', leagueId);
        }

        if (options?.season) {
            query = query.eq('season', options.season);
        }

        if (options?.upcomingOnly) {
            const now = new Date().toISOString();
            query = query.gte('start_time', now);
            
            if (options?.daysLimit) {
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() + options.daysLimit);
                query = query.lte('start_time', limitDate.toISOString());
            }
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching matches:', error.message);
            throw new Error(`Error industrial de base de datos: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Map DB fields to GroupMatch interface
        return data.map((m: any) => {
            const dateObj = new Date(m.start_time);
            const date = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
            const time = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

            return {
                id: m.id,
                league_id: m.league_id,
                group: m.metadata?.group || m.metadata?.round || 'U',
                homeTeam: m.home_team,
                awayTeam: m.away_team,
                homeTeamLogo: m.home_team_logo,
                awayTeamLogo: m.away_team_logo,
                date,
                time,
                startTime: m.start_time,
                stadium: m.metadata?.stadium || 'TBD',
                city: m.metadata?.city || 'TBD',
                status: this.mapStatus(m.status),
                homeScore: m.home_score,
                awayScore: m.away_score,
                h2h: m.metadata?.h2h || [],
                metadata: m.metadata
            };
        });
    },

    mapStatus(dbStatus: string): 'scheduled' | 'live' | 'finished' {
        switch (dbStatus) {
            case 'UPCOMING': return 'scheduled';
            case 'LIVE': return 'live';
            case 'FINISHED': return 'finished';
            default: return 'scheduled';
        }
    }
};
