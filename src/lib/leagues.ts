import { fetchFootballData } from './api';

export const LEAGUE_IDS = {
    SPAIN_LA_LIGA: 140,
    ARGENTINA_LIGA_PROFESIONAL: 128,
    ARGENTINA_PRIMERA_B: 129,
    UEFA_EURO: 4,
    UEFA_CHAMPIONS_LEAGUE: 2,
    COPA_AMERICA: 9,
    FIFA_WORLD_CUP: 1
};

export const getLeagueStandings = async (leagueId: number, season: number = 2026, force: boolean = false) => {
    return await fetchFootballData('standings', {
        league: leagueId.toString(),
        season: season.toString()
    }, force);
};

export const getLeagueMatches = async (leagueId: number, season: number = 2026, force: boolean = false) => {
    return await fetchFootballData('fixtures', {
        league: leagueId.toString(),
        season: season.toString(),
        next: '10' // Get next 10 matches by default
    }, force);
};

export const getLiveMatches = async (leagueId?: number, force: boolean = false) => {
    const params: Record<string, string> = { live: 'all' };
    if (leagueId) {
        params.league = leagueId.toString();
    }
    return await fetchFootballData('fixtures', params, force);
};
