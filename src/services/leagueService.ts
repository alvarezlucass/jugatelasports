import { supabase } from '../lib/supabase';
import { fetchFootballData } from '../lib/api';

export const leagueService = {
    /**
     * Sincroniza los equipos de una liga específica desde la API a la base de datos.
     * @param leagueId Identificador interno (ej: 'lpf')
     * @param apiLeagueId ID en API-Football (ej: 128)
     */
    async syncTeams(leagueId: string, apiLeagueId: number) {
        console.log(`Sincronizando equipos para league_id: ${leagueId}...`);
        try {
            const data = await fetchFootballData('teams', { league: apiLeagueId.toString(), season: '2024' });
            
            if (!data || !data.response) throw new Error('No se recibió respuesta de la API');

            const teamsToSync = data.response.map((item: any) => ({
                id: item.team.id,
                name: item.team.name,
                short_name: item.team.code,
                logo: item.team.logo,
                founded: item.team.founded,
                stadium_name: item.venue.name,
                metadata: {
                    city: item.venue.city,
                    capacity: item.venue.capacity,
                    address: item.venue.address
                }
            }));

            // 1. Upsert Teams
            const { error: teamError } = await supabase
                .from('teams')
                .upsert(teamsToSync, { onConflict: 'id' });

            if (teamError) throw teamError;

            // 2. Asociar equipos con la liga (league_teams)
            const relations = teamsToSync.map((t: any) => ({
                league_id: leagueId,
                team_id: t.id,
                season: 2024
            }));

            const { error: relError } = await supabase
                .from('league_teams')
                .upsert(relations, { onConflict: 'league_id, team_id, season' });

            if (relError) throw relError;

            return { success: true, count: teamsToSync.length };
        } catch (error) {
            console.error('Error syncing teams:', error);
            return { success: false, error };
        }
    },

    /**
     * Sincroniza la tabla de posiciones (Standings)
     */
    async syncStandings(leagueId: string, apiLeagueId: number, season: number = 2024) {
        try {
            const data = await fetchFootballData('standings', { 
                league: apiLeagueId.toString(), 
                season: season.toString() 
            });

            if (!data || !data.response || data.response.length === 0) return { success: false };

            const standingsRaw = data.response[0].league.standings[0];
            
            const standingsToSync = standingsRaw.map((s: any) => ({
                league_id: leagueId,
                season: season,
                team_id: s.team.id,
                rank: s.rank,
                points: s.points,
                played: s.all.played,
                win: s.all.win,
                draw: s.all.draw,
                lose: s.all.lose,
                goals_for: s.all.goals.for,
                goals_against: s.all.goals.against,
                form: s.form,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('standings')
                .upsert(standingsToSync, { onConflict: 'league_id, season, team_id' });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error syncing standings:', error);
            return { success: false, error };
        }
    },

    /**
     * Sincroniza el plantel (jugadores) de un equipo
     */
    async syncSquad(teamId: number) {
        console.log(`Sincronizando plantel para team_id: ${teamId}...`);
        try {
            const data = await fetchFootballData('players/squads', { team: teamId.toString() });
            if (!data || !data.response || data.response.length === 0) return { success: false };

            const squad = data.response[0].players;
            const playersToSync = squad.map((p: any) => ({
                id: p.id,
                team_id: teamId,
                name: p.name,
                age: p.age,
                number: p.number,
                position: p.position,
                photo: p.photo,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('players')
                .upsert(playersToSync, { onConflict: 'id' });

            if (error) throw error;
            return { success: true, count: playersToSync.length };
        } catch (error) {
            console.error(`Error syncing squad for team ${teamId}:`, error);
            return { success: false, error };
        }
    },

    /**
     * Sincroniza el Cuerpo Técnico (Coaches)
     */
    async syncCoach(teamId: number) {
        try {
            const data = await fetchFootballData('coachs', { team: teamId.toString() });
            if (!data || !data.response) return { success: false };

            const coaches = data.response.map((c: any) => ({
                id: c.id,
                team_id: teamId,
                name: c.name,
                age: c.age,
                photo: c.photo,
                nationality: c.nationality,
                updated_at: new Date().toISOString()
            }));

            const { error } = await supabase
                .from('coaches')
                .upsert(coaches, { onConflict: 'id' });

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`Error syncing coach for team ${teamId}:`, error);
            return { success: false, error };
        }
    },

    /**
     * Sincroniza Trofeos (Historia)
     */
    async syncTrophies(teamId: number) {
        try {
            const data = await fetchFootballData('trophies', { player: '', coach: '', team: teamId.toString() });
            if (!data || !data.response) return { success: false };

            const trophies = data.response.map((t: any) => ({
                team_id: teamId,
                league: t.league,
                country: t.country,
                season: t.season,
                place: t.place
            }));

            // Eliminar antiguos para evitar duplicados si la API cambia formato
            await supabase.from('trophies').delete().eq('team_id', teamId);

            const { error } = await supabase
                .from('trophies')
                .insert(trophies);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`Error syncing trophies for team ${teamId}:`, error);
            return { success: false, error };
        }
    },

    /**
     * Orquestador de Sincronización Profunda para un equipo
     */
    async syncTeamDeepData(teamId: number) {
        console.log(`Iniciando sincronización PROFUNDA para team_id: ${teamId}...`);
        const squadRes = await this.syncSquad(teamId);
        const coachRes = await this.syncCoach(teamId);
        const trophyRes = await this.syncTrophies(teamId);
        
        return {
            success: squadRes.success && coachRes.success && trophyRes.success,
            squad: squadRes.count || 0
        };
    },

    /**
     * Obtiene los equipos de una liga desde la base de datos local
     */
    async getTeams(leagueId: string) {
        const { data, error } = await supabase
            .from('league_teams')
            .select(`
                team_id,
                teams (
                    id, name, logo, short_name, stadium_name, colors, founded
                )
            `)
            .eq('league_id', leagueId);
        
        return { data: data?.map(d => d.teams) || [], error };
    },

    /**
     * Obtiene detalles profundos de un equipo (Plantel, DT, Trofeos)
     */
    async getTeamFullDetails(teamId: number) {
        const [players, coaches, trophies] = await Promise.all([
            supabase.from('players').select('*').eq('team_id', teamId).order('number', { ascending: true }),
            supabase.from('coaches').select('*').eq('team_id', teamId),
            supabase.from('trophies').select('*').eq('team_id', teamId).order('season', { ascending: false })
        ]);

        return {
            players: players.data || [],
            coaches: coaches.data || [],
            trophies: trophies.data || []
        };
    },

    /**
     * Obtiene las posiciones desde la DB
     */
    async getStandings(leagueId: string, season: number = 2024) {
        const { data, error } = await supabase
            .from('standings')
            .select(`
                *,
                teams (name, logo)
            `)
            .eq('league_id', leagueId)
            .eq('season', season)
            .order('rank', { ascending: true });
        
        return { data, error };
    }
};
