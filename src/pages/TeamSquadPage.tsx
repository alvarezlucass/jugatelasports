import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TeamSquadView } from '../components/competition/TeamSquadView';
import { getTeamStaticData } from '../data/worldCupPersistence';
import { supabase } from '../lib/supabase';
import { databaseService } from '../services/databaseService';

function mapPosition(pos: string): 'G' | 'D' | 'M' | 'F' {
    if (!pos) return 'M';
    const p = pos.toLowerCase();
    if (p.includes('goalkeeper')) return 'G';
    if (p.includes('defender')) return 'D';
    if (p.includes('midfielder')) return 'M';
    if (p.includes('attacker') || p.includes('forward')) return 'F';
    return 'M';
}

const SPANISH_TO_DB_TEAM_NAME: Record<string, string> = {
    "Alemania": "Germany",
    "Arabia Saudita": "Saudi Arabia",
    "Argelia": "Algeria",
    "Argentina": "Argentina",
    "Australia": "Australia",
    "Austria": "Austria",
    "Bélgica": "Belgium",
    "Bosnia": "Bosnia & Herzegovina",
    "Brasil": "Brazil",
    "Cabo Verde": "Cape Verde Islands",
    "Canadá": "Canada",
    "Colombia": "Colombia",
    "Corea del Sur": "South Korea",
    "Costa de Marfil": "Ivory Coast",
    "Croacia": "Croatia",
    "Curazao": "Curaçao",
    "Ecuador": "Ecuador",
    "Egipto": "Egypt",
    "Escocia": "Scotland",
    "España": "Spain",
    "Francia": "France",
    "Ghana": "Ghana",
    "Haití": "Haiti",
    "Irak": "Iraq",
    "Irán": "Iran",
    "Inglaterra": "England",
    "Japón": "Japan",
    "Jordania": "Jordan",
    "Marruecos": "Morocco",
    "México": "Mexico",
    "Noruega": "Norway",
    "Nueva Zelanda": "New Zealand",
    "Países Bajos": "Netherlands",
    "Panamá": "Panama",
    "Paraguay": "Paraguay",
    "Portugal": "Portugal",
    "Qatar": "Qatar",
    "RD Congo": "Congo DR",
    "República Checa": "Czech Republic",
    "Senegal": "Senegal",
    "Sudáfrica": "South Africa",
    "Suecia": "Sweden",
    "Suiza": "Switzerland",
    "Túnez": "Tunisia",
    "Turquía": "Turkey",
    "Uruguay": "Uruguay",
    "USA": "USA",
    "Uzbekistán": "Uzbekistan"
};

export const TeamSquadPage: React.FC = () => {
    const { teamName } = useParams<{ teamName: string }>();
    const navigate = useNavigate();
    const decodedName = teamName ? decodeURIComponent(teamName) : 'México';
    
    const staticData = getTeamStaticData(decodedName);
    const [teamInfo, setTeamInfo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [topPerformers, setTopPerformers] = useState<{ scorers: any[], assists: any[] }>({ scorers: [], assists: [] });

    useEffect(() => {
        const loadTeamData = async () => {
            setLoading(true);
            try {
                const dbName = SPANISH_TO_DB_TEAM_NAME[decodedName] || decodedName;
                const normalized = dbName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const staticId = staticData?.id;

                // 1. Fetch World Cup team relations to ensure we only match national teams
                const { data: wcRelations } = await supabase
                    .from('league_teams')
                    .select('team_id')
                    .eq('league_id', 'world-cup-2026');
                
                const wcTeamIds = (wcRelations || []).map(r => r.team_id);

                // Find team by name first (fuzzy matching case-insensitive, with name translation/normalization)
                let query = supabase
                    .from('teams')
                    .select('*')
                    .or(`name.ilike."${dbName}",name.ilike."${normalized}"`);
                
                if (wcTeamIds.length > 0) {
                    query = query.in('id', wcTeamIds);
                }

                let { data: teamList, error: teamError } = await query.limit(1);
                
                if (teamError) throw teamError;

                // Fallback to short_name if name search yields no results
                if ((!teamList || teamList.length === 0) && staticId) {
                    let fallbackQuery = supabase
                        .from('teams')
                        .select('*')
                        .eq('short_name', staticId);
                    
                    if (wcTeamIds.length > 0) {
                        fallbackQuery = fallbackQuery.in('id', wcTeamIds);
                    }
                    
                    const { data: fallbackList, error: fallbackError } = await fallbackQuery.limit(1);
                    if (!fallbackError && fallbackList && fallbackList.length > 0) {
                        teamList = fallbackList;
                    }
                }
                
                if (teamList && teamList.length > 0) {
                    const dbTeam = teamList[0];
                    
                    // Fetch players
                    const { data: playersList } = await supabase
                        .from('players')
                        .select('*')
                        .eq('team_id', dbTeam.id)
                        .order('number', { ascending: true, nullsFirst: false });
                        
                    // Fetch coaches
                    const { data: coachesList } = await supabase
                        .from('coaches')
                        .select('*')
                        .eq('team_id', dbTeam.id);
                        
                    // Map and merge
                    setTeamInfo({
                        id: dbTeam.short_name || dbTeam.id.toString(),
                        name: decodedName, // Keep the Spanish user-friendly name for displaying
                        logo: dbTeam.logo,
                        titles: staticData?.titles || 0,
                        bestResult: staticData?.bestResult || 'En proceso...',
                        appearances: staticData?.appearances || 0,
                        lastResults: staticData?.lastResults || ['D', 'D', 'D'],
                        description: staticData?.description || `Perfil oficial de la selección de ${decodedName}.`,
                        detailedHistory: staticData?.detailedHistory,
                        continent: staticData?.continent || 'Global',
                        coachingStaff: (coachesList || [])
                            .slice()
                            .sort((a, b) => b.id - a.id)
                            .slice(0, 1)
                            .map(c => ({
                                id: c.id.toString(),
                                name: c.name,
                                role: 'Director Técnico',
                                nationality: c.nationality,
                                image: c.photo
                            })),
                        players: (playersList || []).map(p => ({
                            id: p.id.toString(),
                            number: p.number || 99,
                            name: p.name,
                            position: mapPosition(p.position),
                            age: p.age || 25,
                            club: p.metadata?.club || 'Club Profesional',
                            isStar: false,
                            image: p.photo
                        }))
                    });
                } else {
                    // Fallback to static data
                    setTeamInfo(staticData || {
                        id: 'TEMP',
                        name: decodedName,
                        titles: 0,
                        bestResult: 'En proceso...',
                        appearances: 0,
                        lastResults: ['D', 'D', 'D'],
                        description: `No se encontraron datos para la selección de ${decodedName} en la base de datos.`,
                        continent: 'Global',
                        coachingStaff: [],
                        players: []
                    });
                }

                // Fetch top performers (Goals & Assists)
                const perf = await databaseService.fetchTopPerformers('world-cup-2026');
                if (perf.success) {
                    setTopPerformers({
                        scorers: perf.scorers || [],
                        assists: perf.assists || []
                    });
                }
            } catch (error) {
                console.error('Error fetching team dynamic data:', error);
                setTeamInfo(staticData || null);
            } finally {
                setLoading(false);
            }
        };
        loadTeamData();
    }, [decodedName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!teamInfo) {
        return (
            <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Selección no encontrada</h2>
                <button onClick={() => navigate(-1)} className="px-8 py-3 bg-blue-600 rounded-2xl font-black uppercase tracking-widest text-[10px]">Volver</button>
            </div>
        );
    }

    return <TeamSquadView team={teamInfo} topPerformers={topPerformers} />;
};
