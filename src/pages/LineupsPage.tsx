import React, { useState } from 'react';
import { ChevronLeft, Users, Shield, Zap, CircleDot, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WORLD_CUP_TEAMS_HISTORY } from '../data/worldCupPersistence';

// Tipos para las alineaciones
type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

interface PlayerPosition {
    id: string;
    number: number;
    name: string;
    positionCode: Position;
    x: number; // Porcentaje de ancho (0-100)
    y: number; // Porcentaje de alto (0-100)
    isStar?: boolean;
}

interface FormationData {
    teamId: string;
    teamName: string;
    formation: string; // ej "4-3-3"
    coach: string;
    players: PlayerPosition[];
}

// Datos Mock (reemplazar con llamadas reales a API más adelante)
const MOCK_FORMATIONS: Record<string, FormationData> = {
    "ARG": {
        teamId: "ARG",
        teamName: "Argentina",
        formation: "4-3-3",
        coach: "Lionel Scaloni",
        players: [
            { id: "a1", number: 23, name: "E. Martínez", positionCode: 'GK', x: 50, y: 90 },
            { id: "a2", number: 26, name: "N. Molina", positionCode: 'DEF', x: 80, y: 70 },
            { id: "a3", number: 13, name: "C. Romero", positionCode: 'DEF', x: 65, y: 75 },
            { id: "a4", number: 19, name: "N. Otamendi", positionCode: 'DEF', x: 35, y: 75 },
            { id: "a5", number: 3, name: "N. Tagliafico", positionCode: 'DEF', x: 20, y: 70 },
            { id: "a6", number: 7, name: "R. De Paul", positionCode: 'MID', x: 75, y: 45 },
            { id: "a7", number: 24, name: "E. Fernández", positionCode: 'MID', x: 50, y: 55 },
            { id: "a8", number: 20, name: "A. Mac Allister", positionCode: 'MID', x: 25, y: 45 },
            { id: "a9", number: 10, name: "L. Messi", positionCode: 'FWD', x: 75, y: 20, isStar: true },
            { id: "a10", number: 9, name: "J. Álvarez", positionCode: 'FWD', x: 50, y: 15 },
            { id: "a11", number: 11, name: "A. Di María", positionCode: 'FWD', x: 25, y: 20 }
        ]
    },
    "MEX": {
        teamId: "MEX",
        teamName: "México",
        formation: "4-2-3-1",
        coach: "Javier Aguirre",
        players: [
            { id: "m1", number: 13, name: "G. Ochoa", positionCode: 'GK', x: 50, y: 90 },
            { id: "m2", number: 19, name: "J. Sánchez", positionCode: 'DEF', x: 80, y: 70 },
            { id: "m3", number: 3, name: "C. Montes", positionCode: 'DEF', x: 65, y: 75 },
            { id: "m4", number: 5, name: "J. Vásquez", positionCode: 'DEF', x: 35, y: 75 },
            { id: "m5", number: 23, name: "J. Gallardo", positionCode: 'DEF', x: 20, y: 70 },
            { id: "m6", number: 4, name: "E. Álvarez", positionCode: 'MID', x: 60, y: 55 },
            { id: "m7", number: 24, name: "L. Chávez", positionCode: 'MID', x: 40, y: 55 },
            { id: "m8", number: 15, name: "U. Antuna", positionCode: 'MID', x: 80, y: 35 },
            { id: "m9", number: 17, name: "O. Pineda", positionCode: 'MID', x: 50, y: 35 },
            { id: "m10", number: 22, name: "H. Lozano", positionCode: 'MID', x: 20, y: 35, isStar: true },
            { id: "m11", number: 11, name: "S. Giménez", positionCode: 'FWD', x: 50, y: 15 }
        ]
    }
};

const TEAMS = Object.values(WORLD_CUP_TEAMS_HISTORY).filter(t => MOCK_FORMATIONS[t.id]);

// --- COMPONENTES AUXILIARES ---

const PlayerNode = ({ player, isSelected }: { player: PlayerPosition, isSelected: boolean }) => {
    // Determinar estilo en base a la línea/posición
    let bgColor = "bg-white text-[#121820]";
    let borderColor = "border-white/20";
    
    if (player.positionCode === 'GK') {
        bgColor = "bg-yellow-400 text-black";
        borderColor = "border-yellow-500";
    } else if (player.positionCode === 'MID') {
        bgColor = "bg-blue-500 text-white";
        borderColor = "border-blue-400";
    } else if (player.positionCode === 'FWD') {
        bgColor = "bg-red-500 text-white";
        borderColor = "border-red-400";
    }

    return (
        <div 
            className={`absolute flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-10'}`}
            style={{ left: `${player.x}%`, top: `${player.y}%` }}
        >
            <div className={`relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full shadow-lg ${bgColor} border-2 ${borderColor} font-black text-xs md:text-sm`}>
                {player.number}
                
                {/* Indicador de Superestrella */}
                {player.isStar && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                        <Zap size={10} className="text-black fill-current" />
                    </div>
                )}

                {/* Pulsing effect on selection */}
                {isSelected && (
                    <div className="absolute inset-0 rounded-full animate-ping opacity-50 border-2 border-current shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                )}
            </div>
            {/* Etiqueta del nombre del jugador */}
            <div className={`mt-1 bg-black/70 backdrop-blur-sm text-white text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap border ${isSelected ? 'border-primary text-primary' : 'border-white/10 text-zinc-300'}`}>
                {player.name}
            </div>
        </div>
    );
};

// --- PAGINA DE ALINEACIONES ---

export const LineupsPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTeam, setSelectedTeam] = useState<string>("MEX"); // Por defecto México
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerPosition | null>(null);

    const formation = MOCK_FORMATIONS[selectedTeam];

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 bg-[#0A0D12]">
            {/* Header Extendido */}
            <div className="bg-gradient-to-b from-blue-900/20 to-[#0A0D12] pt-12 pb-6 px-4">
                <div className="container mx-auto max-w-4xl">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
                    >
                        <ChevronLeft size={16} /> Volver
                    </button>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Pizarra Táctica
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                                Alineaciones
                            </h1>
                        </div>
                        
                        {/* Selector de Equipos */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:pb-0">
                            {TEAMS.map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => {
                                        setSelectedTeam(team.id);
                                        setSelectedPlayer(null); // Resetear jugador seleccionado al cambiar equipo
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                                        selectedTeam === team.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400' 
                                        : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5 hover:border-white/20'
                                    }`}
                                >
                                    <span className="w-4 h-3 rounded-[2px] overflow-hidden flex items-center">
                                        <img src={`https://flagcdn.com/${team.id === 'ARG' ? 'ar' : team.id === 'MEX' ? 'mx' : 'br'}.svg`} className="w-full h-full object-cover" alt={team.id} />
                                    </span>
                                    {team.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                {/* Resumen del Equipo */}
                <div className="bg-[#121820]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-4 md:p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center p-2 border border-white/10 shadow-inner">
                            <img src={`https://flagcdn.com/${formation.teamId === 'ARG' ? 'ar' : formation.teamId === 'MEX' ? 'mx' : 'br'}.svg`} className="w-full rounded shadow-sm" alt={formation.teamName} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{formation.teamName}</h2>
                            <p className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 mt-1">
                                <Users size={12} className="text-blue-500" />
                                Entrenador: <span className="text-zinc-300">{formation.coach}</span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="bg-black/30 px-4 py-2 rounded-xl border border-white/5 text-center flex-1 md:flex-none">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Formación</p>
                            <p className="text-xl font-black text-primary">{formation.formation}</p>
                        </div>
                        <div className="bg-black/30 px-4 py-2 rounded-xl border border-white/5 text-center flex-1 md:flex-none">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Estilo</p>
                            <p className="text-sm font-black text-white flex items-center justify-center gap-1 h-7">Ofensivo <Flame className="w-3 h-3 text-red-500" /></p>
                        </div>
                    </div>
                </div>

                {/* El Campo de Juego */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {/* PITCH 2D */}
                        <div className="relative w-full aspect-[2/3] md:aspect-[3/4] max-h-[700px] bg-gradient-to-b from-green-800 to-green-600 rounded-3xl border-4 border-white/20 shadow-2xl overflow-hidden mx-auto">
                            {/* Patrón de pasto cortado */}
                            <div className="absolute inset-0 opacity-10" style={{
                                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 10%, #000 10%, #000 20%)`
                            }} />
                            
                            {/* Líneas de la cancha (Tension) */}
                            {/* Borde Exterior */}
                            <div className="absolute inset-4 border-2 border-white/40" />
                            {/* Línea Central */}
                            <div className="absolute top-1/2 left-4 right-4 h-0 border-t-2 border-white/40" />
                            {/* Círculo Central */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-white/40" />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/40" />
                            
                            {/* Área Superior (Rival - visual only) */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-white/40 border-t-0" />
                            {/* Área Chica Superior */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-white/40 border-t-0" />
                            {/* Media Luna Superior */}
                            <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white/40 border-t-0 rounded-b-full opacity-60" />

                            {/* Área Inferior (Local - Base del equipo seleccionado) */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-24 border-2 border-white/40 border-b-0" />
                            {/* Área Chica Inferior */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-8 border-2 border-white/40 border-b-0" />
                            {/* Media Luna Inferior */}
                            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 w-16 h-8 border-2 border-white/40 border-b-0 rounded-t-full opacity-60" />
                            
                            {/* Corner Arcs */}
                            <div className="absolute top-4 left-4 w-4 h-4 border-2 border-white/40 border-t-0 border-l-0 rounded-br-full" />
                            <div className="absolute top-4 right-4 w-4 h-4 border-2 border-white/40 border-t-0 border-r-0 rounded-bl-full" />
                            <div className="absolute bottom-4 left-4 w-4 h-4 border-2 border-white/40 border-b-0 border-l-0 rounded-tr-full" />
                            <div className="absolute bottom-4 right-4 w-4 h-4 border-2 border-white/40 border-b-0 border-r-0 rounded-tl-full" />

                            {/* JUGADORES */}
                            <div className="absolute inset-4 z-20">
                                {formation.players.map(player => (
                                    <div key={player.id} onClick={(e) => { e.stopPropagation(); setSelectedPlayer(player); }}>
                                        <PlayerNode player={player} isSelected={selectedPlayer?.id === player.id} />
                                    </div>
                                ))}
                            </div>
                            
                            {/* Overlay if click outside to deselect */}
                            <div className="absolute inset-0 z-10" onClick={() => setSelectedPlayer(null)} />
                        </div>
                    </div>

                    {/* Detalle del Jugador Seleccionado */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-[#121820]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-xl h-[400px] flex flex-col">
                            {selectedPlayer ? (
                                <div className="animate-in slide-in-from-right-4 fade-in duration-300 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex bg-white/5 border border-white/10 rounded-2xl w-16 h-16 items-center justify-center shrink-0">
                                            <span className="text-3xl font-black text-white">{selectedPlayer.number}</span>
                                        </div>
                                        {selectedPlayer.isStar && (
                                            <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                                                <Zap size={12} className="fill-current" /> Jugador Franquicia
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{selectedPlayer.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest 
                                                ${selectedPlayer.positionCode === 'GK' ? 'bg-yellow-500/20 text-yellow-400' :
                                                  selectedPlayer.positionCode === 'DEF' ? 'bg-white/10 text-zinc-300' :
                                                  selectedPlayer.positionCode === 'MID' ? 'bg-blue-500/20 text-blue-400' :
                                                  'bg-red-500/20 text-red-400'}
                                            `}>
                                                {selectedPlayer.positionCode === 'GK' ? 'Portero' :
                                                 selectedPlayer.positionCode === 'DEF' ? 'Defensa' :
                                                 selectedPlayer.positionCode === 'MID' ? 'Mediocampista' : 'Delantero'}
                                            </span>
                                            <span className="text-zinc-500 text-xs flex items-center gap-1 font-medium"><Shield size={12} /> Titular indiscutible</span>
                                        </div>
                                    </div>

                                    {/* Stats Mock */}
                                    <div className="space-y-4 flex-1">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-400 font-bold">Estado Físico</span>
                                                <span className="text-primary font-black">95%</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-primary h-1.5 rounded-full" style={{ width: '95%' }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-zinc-400 font-bold">Rendimiento en Torneo</span>
                                                <span className="text-blue-400 font-black">8.5</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                    <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-[2rem] flex items-center justify-center mb-6">
                                        <CircleDot size={32} className="text-zinc-500" />
                                    </div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Análisis de Plantilla</h3>
                                    <p className="text-sm font-medium text-zinc-400 max-w-[200px]">Selecciona un jugador sobre la pizarra táctica para ver sus estadísticas de torneo.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
