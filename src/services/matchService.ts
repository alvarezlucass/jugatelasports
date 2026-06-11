import { supabase } from '../lib/supabase';
import { type GroupMatch } from '../data/worldCupPersistence';

export const matchService = {
    async getMatches(leagueId?: string, options?: { upcomingOnly?: boolean; liveOnly?: boolean; status?: string[]; daysLimit?: number; season?: number; limit?: number }): Promise<GroupMatch[]> {
        let query = supabase
            .from('matches')
            .select('*');

        if (leagueId) {
            // league_id in DB uses dbId strings (e.g., 'lpf', 'ucl', 'world-cup-2026')
            query = query.eq('league_id', leagueId);
        }

        if (options?.season) {
            query = query.eq('season', options.season);
        }

        if (options?.status) {
            if (options.status.includes('FINISHED')) {
                const liveWindowAgo = new Date(new Date().getTime() - 2.5 * 60 * 60 * 1000).toISOString();
                query = query.or(`status.in.(${options.status.join(',')}),and(status.in.(SCHEDULED,UPCOMING,scheduled,upcoming),start_time.lt.${liveWindowAgo})`);
            } else {
                query = query.in('status', options.status);
            }
            
            // Si incluye FINISHED, ordernar descendente (del mas nuevo al mas viejo)
            if (options.status.includes('FINISHED')) {
                query = query.order('start_time', { ascending: false });
                
                // Si piden terminados, opcionalmente filtrar por ultimo mes
                if (options.daysLimit) {
                    const limitDate = new Date();
                    limitDate.setDate(limitDate.getDate() - options.daysLimit);
                    query = query.gte('start_time', limitDate.toISOString());
                }
            } else {
                query = query.order('start_time', { ascending: true });
            }
        } else if (options?.liveOnly) {
            const now = new Date();
            const nowStr = now.toISOString();
            // Restar 2.5 horas para atrapar partidos que recién empezaron (un partido dura ~2h)
            const liveWindowAgo = new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString();
            
            // Buscar partidos con estado en vivo, O partidos programados que debieron empezar en las ultimas 2.5 horas
            query = query.or(`status.in.(LIVE,IN_PLAY,IN_PROGRESS,PAUSED,HALFTIME),and(status.in.(SCHEDULED,UPCOMING),start_time.lte.${nowStr},start_time.gte.${liveWindowAgo})`)
                         .order('start_time', { ascending: true });
        } else if (options?.upcomingOnly) {
            const now = new Date().toISOString();
            query = query.gte('start_time', now)
                         .order('start_time', { ascending: true });
            
            if (options?.daysLimit) {
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() + options.daysLimit);
                query = query.lte('start_time', limitDate.toISOString());
            }
        } else {
            query = query.order('start_time', { ascending: true });
        }

        if (options?.limit) {
            query = query.limit(options.limit);
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
            let status: 'scheduled' | 'live' | 'finished' = this.mapStatus(m.status);
            
            // Forzar LIVE/FINISHED si es programado pero la fecha de inicio ya pasó
            if ((status === 'scheduled' || status === 'live') && m.start_time) {
                const matchTime = new Date(m.start_time).getTime();
                const now = Date.now();
                const elapsedMins = (now - matchTime) / 60000;
                
                if (elapsedMins >= 0 && elapsedMins < 115) {
                    status = 'live';
                } else if (elapsedMins >= 115) {
                    status = 'finished';
                }
            }
            
            let homeScore = m.home_score;
            let awayScore = m.away_score;
            let time = m.start_time ? m.start_time.split('T')[1].substring(0, 5) : '00:00';

            return {
                id: m.id.toString(),
                league_id: m.league_id,
                group: m.metadata?.group || m.metadata?.round || 'U',
                homeTeam: m.home_team,
                awayTeam: m.away_team,
                homeTeamLogo: m.home_team_logo,
                awayTeamLogo: m.away_team_logo,
                homeTeamId: m.metadata?.home_id || (m.home_team_logo ? m.home_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined),
                awayTeamId: m.metadata?.away_id || (m.away_team_logo ? m.away_team_logo.match(/\/teams\/(\d+)\.png/)?.[1] : undefined),
                date: m.start_time ? m.start_time.split('T')[0] : '2026-06-11',
                time: time,
                startTime: m.start_time,
                stadium: m.metadata?.stadium || 'TBD',
                city: m.metadata?.city || 'TBD',
                status: status,
                homeScore: homeScore,
                awayScore: awayScore,
                h2h: m.metadata?.h2h || [],
                metadata: m.metadata
            };
        });
    },

    mapStatus(dbStatus: string): 'scheduled' | 'live' | 'finished' {
        switch (dbStatus) {
            case 'UPCOMING': return 'scheduled';
            case 'LIVE': return 'live';
            case 'IN_PLAY': return 'live';
            case 'IN_PROGRESS': return 'live';
            case 'PAUSED': return 'live';
            case 'HALFTIME': return 'live';
            case 'FINISHED': return 'finished';
            default: return 'scheduled';
        }
    }
};
