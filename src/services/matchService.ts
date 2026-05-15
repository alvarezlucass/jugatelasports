import { supabase } from '../lib/supabase';
import { type GroupMatch } from '../data/worldCupPersistence';

export const matchService = {
    async getMatches(): Promise<GroupMatch[]> {
        const { data, error } = await supabase
            .from('matches')
            .select('*')
            .order('start_time', { ascending: true });

        if (error) {
            console.error('Error fetching matches:', error.message);
            throw new Error(`Error industrial de base de datos: ${error.message}`);
        }

        if (!data || data.length === 0) {
            return [];
        }

        // Map DB fields to GroupMatch interface
        return data.map((m: any) => ({
            id: m.id,
            group: m.metadata?.group || 'U',
            homeTeam: m.home_team,
            awayTeam: m.away_team,
            date: m.start_time.split('T')[0],
            time: m.start_time.split('T')[1].substring(0, 5),
            stadium: m.metadata?.stadium || 'TBD',
            city: m.metadata?.city || 'TBD',
            status: this.mapStatus(m.status),
            homeScore: m.home_score,
            awayScore: m.away_score,
            h2h: m.metadata?.h2h || []
        }));
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
