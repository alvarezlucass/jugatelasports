import React, { useState, useEffect } from 'react';
import { 
    X, 
    Users, 
    Trophy, 
    Shield, 
    ChevronRight, 
    Star, 
    Calendar,
    MapPin,
    Activity,
    Clock,
    Zap
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { leagueService } from '../../services/leagueService';
import { supabase } from '../../lib/supabase';

interface TeamDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamId: string | number | null;
}

export const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({
    isOpen,
    onClose,
    teamId
}) => {
    const [team, setTeam] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'squad' | 'staff' | 'history'>('history');
    const [details, setDetails] = useState<{ players: any[], coaches: any[], trophies: any[] }>({
        players: [],
        coaches: [],
        trophies: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            if (!teamId || isNaN(Number(teamId))) {
                setLoading(false);
                setTeam(null);
                return;
            }
            loadDetails();
        } else {
            setTeam(null);
            setDetails({ players: [], coaches: [], trophies: [] });
            setActiveTab('history');
        }
    }, [isOpen, teamId]);

    const loadDetails = async () => {
        setLoading(true);
        try {
            // Agregamos un timeout de 5 segundos para evitar que extensiones bloqueen la promesa eternamente
            const fetchPromise = supabase
                .from('teams')
                .select('*')
                .eq('id', teamId)
                .single();
                
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
            
            const { data: teamData } = await Promise.race([fetchPromise, timeoutPromise]) as any;
            
            if (teamData) {
                setTeam(teamData);
                // Fetch deep details with timeout
                const detailsPromise = leagueService.getTeamFullDetails(parseInt(teamId!.toString()));
                const detailsData = await Promise.race([detailsPromise, timeoutPromise]) as any;
                setDetails(detailsData);
            }
        } catch (error: any) {
            console.error("Error loading team details (Timeout o Network):", error);
            if (error.message === 'Timeout') {
                alert("La conexión está tardando demasiado. Asegúrate de desactivar AdBlock o React DevTools y recarga la página.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative text-white flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
                    <p className="mt-4 text-xs font-bold animate-pulse tracking-widest uppercase text-blue-400">Cargando expediente...</p>
                </div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <div className="relative bg-[#0F131A] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                        <X size={32} />
                    </div>
                    <h3 className="text-white font-black text-xl mb-2">Equipo no encontrado</h3>
                    <p className="text-zinc-500 text-sm mb-6">No se pudieron cargar los detalles de este equipo. Es posible que no estén disponibles en la base de datos.</p>
                    <button 
                        onClick={onClose}
                        className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-xl transition-colors w-full"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const primaryColor = team.colors?.primary || '#74ACDF';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] bg-[#0F131A] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                
                {/* Header Section */}
                <div className="relative h-48 md:h-64 shrink-0 overflow-hidden">
                    {/* Artistic Background */}
                    <div 
                        className="absolute inset-0 opacity-20 transition-transform duration-1000 scale-110"
                        style={{ 
                            background: `linear-gradient(135deg, ${primaryColor} 0%, #06080C 100%)`,
                            backgroundImage: `url(${team.logo})`,
                            backgroundSize: '150% auto',
                            backgroundPosition: 'center'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F131A] via-[#0F131A]/40 to-transparent" />
                    
                    {/* Close Button */}
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-3 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all z-20 border border-white/5"
                    >
                        <X size={20} />
                    </button>

                    {/* Team Info Overlay */}
                    <div className="absolute bottom-0 left-0 w-full p-8 flex items-end gap-6 md:gap-8">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white/5 backdrop-blur-xl p-4 border border-white/10 shadow-2xl shrink-0">
                            <img src={team.logo} alt={team.name} className="w-full h-full object-contain drop-shadow-lg" />
                        </div>
                        <div className="pb-2 space-y-2">
                            <div className="flex items-center gap-2">
                                <Star className="text-amber-400 fill-amber-400" size={14} />
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Club de Primera</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                                {team.name}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
                                <div className="flex items-center gap-1.5">
                                    <MapPin size={12} className="text-sky-400" />
                                    {team.stadium_name}
                                </div>
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                <div className="flex items-center gap-1.5">
                                    <Clock size={12} className="text-sky-400" />
                                    Fundado en {team.founded}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="px-8 border-b border-white/5 bg-[#131822] shrink-0">
                    <div className="flex items-center gap-8">
                        {[
                            { id: 'squad', label: 'Plantel Actual', icon: Users },
                            { id: 'staff', label: 'Cuerpo Técnico', icon: Activity },
                            { id: 'history', label: 'Vitrina de Trofeos', icon: Trophy },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "flex items-center gap-2 py-6 text-xs font-black uppercase tracking-widest transition-all relative border-b-2",
                                    activeTab === tab.id 
                                        ? "text-sky-400 border-sky-500 scale-105" 
                                        : "text-zinc-500 border-transparent hover:text-zinc-300"
                                )}
                            >
                                <tab.icon size={14} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-[#131822] to-[#0A0D12]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-30">
                            <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Cargando expediente...</p>
                        </div>
                    ) : activeTab === 'squad' ? (
                        <div className="space-y-8">
                            {/* Group by Position */}
                            {['Goalkeeper', 'Defender', 'Midfielder', 'Attacker'].map(pos => {
                                const players = details.players.filter(p => p.position === pos);
                                if (players.length === 0) return null;
                                return (
                                    <div key={pos} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] px-3 py-1 bg-sky-500/10 rounded-lg border border-sky-500/20">
                                                {pos === 'Goalkeeper' ? 'Arqueros' : 
                                                 pos === 'Defender' ? 'Defensores' :
                                                 pos === 'Midfielder' ? 'Mediocampistas' : 'Delanteros'}
                                            </span>
                                            <div className="h-px bg-white/5 flex-1" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {players.map((player, idx) => (
                                                <div 
                                                    key={`${player.id}-${idx}`} 
                                                    className="group relative bg-[#181E29] border border-white/5 rounded-2xl p-4 hover:border-sky-500/30 transition-all hover:-translate-y-1 overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-[2rem]" />
                                                    <div className="relative z-10 flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-xl bg-black/20 overflow-hidden shrink-0 border border-white/5">
                                                            <img src={player.photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <span className="text-sky-400 font-black text-xs">#{player.number || '--'}</span>
                                                                <span className="text-white text-xs font-bold truncate group-hover:text-sky-400 transition-colors">{player.name}</span>
                                                            </div>
                                                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{player.age} Años</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Shoppable Footer Preview */}
                                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Valor Local</span>
                                                        <div className="flex items-center gap-1 text-sky-400 font-bold text-[10px]">
                                                            <Zap size={10} fill="currentColor" />
                                                            {player.price || 500}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : activeTab === 'staff' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {details.coaches.slice().sort((a, b) => b.id - a.id).slice(0, 1).map(coach => (
                                <div key={coach.id} className="bg-[#181E29] border border-white/5 rounded-[2.5rem] p-8 flex items-center gap-8 shadow-xl">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-sky-500/20 shrink-0">
                                        <img src={coach.photo} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20">
                                            <Shield size={12} className="text-sky-400" />
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Director Técnico</span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{coach.name}</h3>
                                        <div className="space-y-1">
                                            <p className="text-xs text-zinc-400 font-medium">Edad: <span className="text-white">{coach.age} Años</span></p>
                                            <p className="text-xs text-zinc-400 font-medium">Nacionalidad: <span className="text-white">{coach.nationality}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {details.coaches.length === 0 && (
                                <div className="col-span-full py-20 text-center opacity-20">
                                    <Activity size={48} className="mx-auto mb-4" />
                                    <p className="font-black uppercase tracking-widest text-xs">Sin información de cuerpo técnico</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8">
                             {/* Trophy Cabinet Grid */}
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {details.trophies.map((trophy, idx) => (
                                    <div key={idx} className="relative group bg-[#181E29] border border-white/5 rounded-3xl p-6 hover:border-amber-500/30 transition-all flex items-center gap-5 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rotate-45 translate-x-12 -translate-y-12" />
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all",
                                            trophy.place === 'Winner' 
                                                ? "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                                                : "bg-[#1F2633] border-white/5 text-zinc-500"
                                        )}>
                                            <Trophy size={28} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-white font-black text-sm uppercase tracking-tighter truncate leading-tight mb-1">
                                                {trophy.league}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 ">
                                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Temporada:</span>
                                                    <span className="text-[10px] font-black text-amber-500">{trophy.season}</span>
                                                </div>
                                                <span className={cn(
                                                    "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md w-fit",
                                                    trophy.place === 'Winner' ? "bg-amber-500 text-black" : "bg-zinc-700 text-zinc-400"
                                                )}>
                                                    {trophy.place === 'Winner' ? 'Campeón' : 'Subcampeón'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {details.trophies.length === 0 && (
                                    <div className="col-span-full py-20 text-center opacity-20">
                                        <Trophy size={48} className="mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-widest text-xs">Sin información de palmarés</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
