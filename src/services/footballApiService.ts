// src/services/footballApiService.ts

import type { Match } from "../types";

/**
 * Football API Service - Production Integration
 * API Provider: API-Football (api-sports.io)
 */

export interface ApiMatchResponse {
    success: boolean;
    data: Match[];
    error?: string;
}

class FootballApiService {
    private readonly API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
    private readonly BASE_URL = 'https://v3.football.api-sports.io';
    private readonly WORLD_CUP_LEAGUE_ID = 1; // World Cup League ID in API-Football
    private readonly SEASON = 2026;

    /**
     * Fetch upcoming matches from real API.
     */
    async getUpcomingMatches(): Promise<ApiMatchResponse> {
        if (!this.API_KEY || this.API_KEY === 'MOCK_KEY') {
            console.warn('API Key not configured. Using fallback mocks if necessary.');
            // En producción real esto fallaría, o podrías devolver un error
        }

        try {
            const response = await fetch(
                `${this.BASE_URL}/fixtures?league=${this.WORLD_CUP_LEAGUE_ID}&season=${this.SEASON}&next=20`,
                {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': this.API_KEY
                    }
                }
            );

            const data = await response.json();

            if (!data.response || data.response.length === 0) {
                return { success: false, data: [], error: 'No fixtures found' };
            }

            const mappedMatches: Match[] = data.response.map((f: any) => ({
                id: f.fixture.id.toString(),
                homeTeam: {
                    id: f.teams.home.name,
                    name: f.teams.home.name,
                    shortName: f.teams.home.name,
                    logo: f.teams.home.logo,
                    colors: ['#ffffff', '#000000']
                },
                awayTeam: {
                    id: f.teams.away.name,
                    name: f.teams.away.name,
                    shortName: f.teams.away.name,
                    logo: f.teams.away.logo,
                    colors: ['#ffffff', '#000000']
                },
                date: f.fixture.date,
                status: this.mapStatus(f.fixture.status.short),
                odds: { home: 1.0, draw: 1.0, away: 1.0 }, // Odds suelen venir por separado en API-Football
                predictionCounts: { home: 0, draw: 0, away: 0 }
            }));

            return { success: true, data: mappedMatches };
        } catch (error: any) {
            console.error('Error fetching matches from API-Football:', error);
            return { success: false, data: [], error: error.message };
        }
    }

    private mapStatus(apiStatus: string): Match['status'] {
        switch (apiStatus) {
            case 'NS': return 'UPCOMING';
            case 'LIVE':
            case '1H':
            case '2H':
            case 'HT': return 'LIVE';
            case 'FT':
            case 'AET':
            case 'PEN': return 'FINISHED';
            default: return 'UPCOMING';
        }
    }

    /**
     * Fetch match statistics/details.
     */
    async getMatchDetails(matchId: string): Promise<any> {
        try {
            const response = await fetch(
                `${this.BASE_URL}/fixtures?id=${matchId}`,
                {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': this.API_KEY
                    }
                }
            );
            const data = await response.json();
            return { success: true, data: data.response?.[0] };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
}

export const footballApiService = new FootballApiService();

