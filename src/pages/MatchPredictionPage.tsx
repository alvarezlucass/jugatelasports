import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, History, Trophy, Zap, Globe, MapPin, Calendar, Info } from 'lucide-react';
import { WORLD_CUP_GROUP_MATCHES, getTeamStaticData, WORLD_CUP_VENUES } from '../data/worldCupPersistence';
import { PredictionForm } from '../components/competition/PredictionForm';
import { MatchChat } from '../components/social/MatchChat';


export const MatchPredictionPage: React.FC = () => {
    const { matchId } = useParams<{ matchId: string }>();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(window.location.search);
    const qHome = queryParams.get('home');
    const qAway = queryParams.get('away');

    const match = useMemo(() => {
        const staticMatch = WORLD_CUP_GROUP_MATCHES.find(m => m.id === matchId);
        if (staticMatch) return staticMatch;
        
        // Dynamic match from bracket
        if (qHome && qAway) {
            return {
                id: matchId!,
                homeTeam: qHome,
                awayTeam: qAway,
                group: 'Eliminatorias',
                date: '19 JUL 2026',
                time: '20:00',
                stadium: 'MetLife Stadium',
                city: 'New York/New Jersey',
                status: 'scheduled' as const,
                h2h: []
            };
        }
        return null;
    }, [matchId, qHome, qAway]);

    const homeTeam = useMemo(() => match ? getTeamStaticData(match.homeTeam) : null, [match]);
    const awayTeam = useMemo(() => match ? getTeamStaticData(match.awayTeam) : null, [match]);
    const venue = useMemo(() => match ? WORLD_CUP_VENUES.find(v => v.name === match.stadium) : null, [match]);



    // Opponent logic
    // const { opponents } = useUser(); // Using queryParam opponentId directly if needed
    const opponentId = queryParams.get('opponentId');
    const selectedMode = queryParams.get('mode') as 'MACHINE' | 'OPPONENT' | 'GROUP';


    if (!match) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <Trophy size={48} className="text-zinc-700 mb-4" />
                <h2 className="text-xl font-black text-white uppercase tracking-tighter">Partido no encontrado</h2>
                <Link to="/predictions" className="mt-6 text-blue-500 font-bold hover:underline">Volver al Centro de Predicciones</Link>
            </div>
        );
    }

    return (
        <div className="pb-24 animate-in fade-in duration-700">
            {/* Header / Back Navigation */}
            <div className="container mx-auto px-4 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeft size={18} /> Volver
                </button>
            </div>

            <div className="container mx-auto px-4 lg:grid lg:grid-cols-12 gap-12">
                {/* Left Side: Stats and History */}
                <div className="lg:col-span-7 space-y-12">
                    {/* Match Hero Card */}
                    <div className="relative overflow-hidden rounded-[3rem] bg-[#0F131A] border border-white/5 p-8 md:p-12">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                                <Zap size={12} className="fill-blue-400" /> Grupo {match.group} • Jornada Mundial
                            </div>

                            <div className="flex items-center justify-between w-full max-w-xl">
                                <div 
                                    onClick={() => navigate(`/worldcup/team/${encodeURIComponent(match.homeTeam)}/squad`)}
                                    className="flex flex-col items-center gap-4 group cursor-pointer"
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/5 bg-white/5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 shadow-2xl group-hover:shadow-blue-500/20">
                                        <img src={`https://flagcdn.com/${homeTeam?.id.toLowerCase().substring(0, 2)}.svg`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter text-center group-hover:text-blue-400 transition-colors">{match.homeTeam}</h3>
                                </div>

                                <div className="text-4xl md:text-6xl font-black text-blue-600 italic">VS</div>

                                <div 
                                    onClick={() => navigate(`/worldcup/team/${encodeURIComponent(match.awayTeam)}/squad`)}
                                    className="flex flex-col items-center gap-4 group cursor-pointer"
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white/5 bg-white/5 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 shadow-2xl group-hover:shadow-blue-500/20">
                                        <img src={`https://flagcdn.com/${awayTeam?.id.toLowerCase().substring(0, 2)}.svg`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter text-center group-hover:text-blue-400 transition-colors">{match.awayTeam}</h3>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                    <Calendar size={14} className="text-blue-500" /> {match.date} • {match.time}
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                                    <MapPin size={14} className="text-blue-500" /> 
                                    {venue?.website ? (
                                        <a href={venue.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors underline decoration-blue-500/30">
                                            {match.stadium}
                                        </a>
                                    ) : (
                                        match.stadium
                                    )}, {match.city}
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Stats Sections */}
                    <div className="grid md:grid-cols-2 gap-8 items-stretch">
                        {/* H2H History */}
                        <div className="flex flex-col gap-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] px-2 h-4">
                                <History size={14} className="text-blue-500" /> Historial Reciente (H2H)
                            </h4>
                            <div className="bg-[#0F131A]/40 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-center gap-3 flex-1">
                                {match.h2h && match.h2h.length > 0 ? (
                                    match.h2h.map((entry: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{entry.competition}</span>
                                                <span className="text-xs font-black text-white">{entry.result}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600">{entry.date.split('-')[0]}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center space-y-2 opacity-50">
                                        <Globe size={24} className="mx-auto text-zinc-700" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Sin registros previos recientes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Team Info / Ranking */}
                        <div className="flex flex-col gap-4">
                            <h4 className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] px-2 h-4">
                                <Info size={14} className="text-blue-500" /> Datos de las Selecciones
                            </h4>
                            <div className="flex flex-col gap-3 flex-1">
                                {[homeTeam, awayTeam].map((team: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        onClick={() => team && navigate(`/worldcup/team/${encodeURIComponent(team.name)}/squad`)}
                                        className="bg-[#0F131A]/40 border border-white/5 rounded-[1.5rem] p-4 flex items-center justify-between flex-1 cursor-pointer hover:border-blue-500/30 hover:bg-white/[0.05] transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden group-hover:scale-110 transition-transform">
                                                <img src={`https://flagcdn.com/${team?.id.toLowerCase().substring(0, 2)}.svg`} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-white uppercase group-hover:text-blue-400 transition-colors">{team?.name}</div>
                                                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{team?.continent}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-blue-500 italic">#{team?.fifaRanking || '--'}</div>
                                            <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Ranking FIFA</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Match Chat / Community Tribuna */}
                    <div className="pt-8">
                        <MatchChat matchId={match.id} />
                    </div>
                </div>

                {/* Right Side: Prediction Form */}
                <div className="lg:col-span-5 mt-12 lg:mt-0">
                    <div className="sticky top-24">
                        <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-b from-blue-500/20 to-transparent">
                            <div className="bg-[#0F131A] rounded-[2.4rem] p-8 border border-white/5 shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Tu Jugada</h2>
                                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Completa los datos de tu Jugada</p>
                                        </div>
                                    </div>

                                    <PredictionForm
                                        matchId={match.id}
                                        mode={selectedMode || 'MACHINE'}
                                        opponentId={opponentId}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
