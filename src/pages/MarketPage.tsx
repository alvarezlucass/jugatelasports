import React, { useState } from 'react';
import { ChevronLeft, Flame, TrendingUp, Search, SlidersHorizontal, ShieldAlert, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { cn } from '../lib/utils';

// ==========================================
// MOCK DATA & TYPES para El Mercado
// ==========================================
export type CardRarity = 'Común' | 'Rara' | 'Épica' | 'Legendaria';

export interface MarketItem {
    id: string;
    type: 'PlayerCard' | 'GoldenPrediction';
    rarity: CardRarity;
    name: string;
    description: string;
    image?: string;
    teamAbbr?: string; // ej. ARG, MEX
    ownerName: string; // Quien lo vende
    price: number;
    trending: 'up' | 'down' | 'stable';
    stats?: {
        ovr: number;
        pac?: number;
        sho?: number;
        pas?: number;
        dri?: number;
        def?: number;
        phy?: number;
    }
}

const MOCK_MARKET: MarketItem[] = [
    {
        id: "m-1",
        type: "PlayerCard",
        rarity: "Legendaria",
        name: "L. Messi (World Cup Hero)",
        description: "Edición conmemorativa del capitán campeón de 2022.",
        teamAbbr: "ARG",
        ownerName: "JugátelaOficial",
        price: 150000,
        trending: "up",
        stats: { ovr: 96, pac: 85, sho: 94, pas: 95, dri: 96, def: 40, phy: 70 }
    },
    {
        id: "m-2",
        type: "GoldenPrediction",
        rarity: "Épica",
        name: "Comodín de la Fase de Grupos",
        description: "Úsala en cualquier partido de fase de grupos para que tu predicción correcta valga x5 exp.",
        ownerName: "AlexTrader99",
        price: 8500,
        trending: "stable"
    },
    {
        id: "m-3",
        type: "PlayerCard",
        rarity: "Rara",
        name: "G. Ochoa",
        description: "El muro tricolor en su última cita mundialista.",
        teamAbbr: "MEX",
        ownerName: "MiguelT",
        price: 42000,
        trending: "down",
        stats: { ovr: 84, def: 88, phy: 80 }
    },
    {
        id: "m-4",
        type: "PlayerCard",
        rarity: "Épica",
        name: "Vini Jr.",
        description: "Desequilibrio puro por la banda izquierda.",
        teamAbbr: "BRA",
        ownerName: "JugátelaOficial",
        price: 98000,
        trending: "up",
        stats: { ovr: 91, pac: 96, sho: 85, pas: 83, dri: 92, def: 35, phy: 72 }
    }
];

// ==========================================
// COMPONENTES SECUNDARIOS
// ==========================================

const RarityBadge = ({ rarity }: { rarity: CardRarity }) => {
    switch (rarity) {
        case 'Legendaria': return <span className="bg-gradient-to-r from-yellow-300 to-yellow-600 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(250,204,21,0.5)]">Legendaria</span>;
        case 'Épica': return <span className="bg-purple-500/20 border border-purple-500/50 text-purple-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Épica</span>;
        case 'Rara': return <span className="bg-blue-500/20 border border-blue-500/50 text-blue-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Rara</span>;
        default: return <span className="bg-white/10 border border-white/20 text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">Común</span>;
    }
};

const MarketCard = ({ item }: { item: MarketItem }) => {
    // Definimos estilo base según la rareza si es carta de jugador
    let bgClasses = "bg-[#121820]";
    let borderClasses = "border-white/10";
    
    if (item.type === 'PlayerCard') {
        if (item.rarity === 'Legendaria') { bgClasses = "bg-gradient-to-b from-yellow-900/40 to-black"; borderClasses = "border-yellow-500/40"; }
        if (item.rarity === 'Épica') { bgClasses = "bg-gradient-to-b from-purple-900/40 to-black"; borderClasses = "border-purple-500/40"; }
    }

    return (
        <div className={cn("rounded-3xl border overflow-hidden relative group hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl flex flex-col items-center justify-between", bgClasses, borderClasses)}>
            
            {/* Si es Predicción Dorada, layout alternativo */}
            {item.type === 'GoldenPrediction' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <Star className="w-48 h-48 animate-pulse text-yellow-500" />
                </div>
            )}

            {/* Cabecera / Info Básica */}
            <div className="p-4 w-full flex justify-between items-start relative z-10">
                <RarityBadge rarity={item.rarity} />
                <div className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-1">
                    Vendedor: <span className={item.ownerName === 'JugátelaOficial' ? 'text-primary' : 'text-zinc-300'}>{item.ownerName}</span>
                </div>
            </div>

            {/* Arte central */}
            <div className="w-full flex-1 flex flex-col items-center justify-center py-4 relative z-10">
                {item.type === 'PlayerCard' ? (
                    <div className="relative text-center">
                        <div className="text-6xl font-black text-white leading-none tracking-tighter drop-shadow-lg">{item.stats?.ovr}</div>
                        <div className="text-sm font-bold text-zinc-400 mt-1">{item.teamAbbr}</div>
                        <img src={`https://flagcdn.com/${item.teamAbbr === 'ARG' ? 'ar' : item.teamAbbr === 'MEX' ? 'mx' : 'br'}.svg`} className="w-8 h-6 mx-auto mt-2 rounded-sm shadow-sm opacity-80" alt={item.teamAbbr} />
                    </div>
                ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-bounce-slow">
                        <Flame className="w-10 h-10 text-white drop-shadow-md" />
                    </div>
                )}
            </div>

            {/* Nombre y stats abajo */}
            <div className="w-full bg-black/60 backdrop-blur-md p-5 border-t border-white/5 relative z-10">
                <h3 className="font-black text-white text-lg leading-tight uppercase mb-1 text-center">{item.name}</h3>
                
                {item.type === 'PlayerCard' && item.stats && (
                    <div className="grid grid-cols-6 gap-1 mt-3.5 mb-2 px-2">
                        {['pac','sho','pas','dri','def','phy'].map(stat => (
                            <div key={stat} className="flex flex-col items-center justify-center">
                                <span className="text-[9px] text-zinc-500 font-bold uppercase">{stat}</span>
                                <span className="text-[11px] text-white font-black">{(item.stats as any)[stat] || '--'}</span>
                            </div>
                        ))}
                    </div>
                )}

                {item.type === 'GoldenPrediction' && (
                    <p className="text-xs text-zinc-400 font-medium text-center mt-2 mb-4 line-clamp-2">
                        {item.description}
                    </p>
                )}

                <button className="w-full mt-3 flex items-center justify-between bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl px-4 py-3 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                    <span className="text-xs font-black uppercase text-white tracking-widest">Ofertar</span>
                    <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-md">
                        <span className="text-yellow-400 text-sm">🪙</span>
                        <span className="font-black text-white">{item.price.toLocaleString()}</span>
                    </div>
                </button>
            </div>
        </div>
    );
};

// ==========================================
// PAGINA PRINCIPAL
// ==========================================

export const MarketPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 bg-[#0A0D12]">
            {/* Efectos de fondo del Mercado */}
            <div className="absolute top-0 right-0 w-[50%] h-[500px] bg-yellow-600/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

            <div className="container mx-auto px-4 lg:px-6 pt-12 relative z-10">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/5"
                    >
                        <ChevronLeft size={16} /> Menú Principal
                    </button>

                    <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-white/5 shadow-inner">
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Mi Balance</span>
                            <span className="text-xl font-black text-white leading-none mt-0.5">{user?.tokens?.toLocaleString()}</span>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
                            <span className="text-lg drop-shadow-sm">🪙</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-black text-yellow-500 uppercase tracking-[0.2em] mb-6">
                        <TrendingUp size={14} /> Bolsa de Jugátela
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-4">
                        El Mercado
                    </h1>
                    <p className="text-zinc-400 text-sm font-medium">
                        Compra cartas de jugadores que suban de valor según su rendimiento real o adquiere predicciones especiales de otros usuarios.
                    </p>
                </div>

                {/* Main Content */}
                <div className="bg-[#121820]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-4 md:p-8 shadow-2xl">
                    
                    {/* Control Bar */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
                        {/* Tabs */}
                        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5 w-full md:w-auto">
                            <button
                                onClick={() => setActiveTab('buy')}
                                className={cn("flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'buy' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white')}
                            >
                                Comprar
                            </button>
                            <button
                                onClick={() => setActiveTab('sell')}
                                className={cn("flex-1 md:flex-none px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all", activeTab === 'sell' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white')}
                            >
                                Vender Mis Cartas
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar jugador o carta..." 
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-white placeholder-zinc-600 outline-none focus:border-blue-500 transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="w-12 h-12 flex items-center justify-center bg-black/40 border border-white/10 rounded-2xl text-zinc-400 hover:text-white transition-colors shrink-0">
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Alerta Educacional */}
                    <div className="flex items-start gap-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 md:p-5 mb-8">
                        <ShieldAlert className="w-6 h-6 text-yellow-500 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">Fluctuación de Precios</h4>
                            <p className="text-xs font-medium text-yellow-200/80 leading-relaxed">
                                El valor de las <strong className="text-yellow-400">PlayerCards</strong> cambia dinámicamente en vivo mientras transcurren los partidos del Mundial 2026 en base al rendimiento real en campo (goles, asistencias, vallas invictas). Compra barato, vende caro.
                            </p>
                        </div>
                    </div>

                    {/* Grid de Mercado */}
                    {activeTab === 'buy' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {MOCK_MARKET.map(item => (
                                <MarketCard key={item.id} item={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-24 h-24 bg-white/5 rounded-[2rem] border border-dashed border-white/20 flex items-center justify-center mb-6">
                                <span className="text-3xl grayscale opacity-50">🃏</span>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Portfolio Vacío</h3>
                            <p className="text-zinc-500 font-medium max-w-sm">No tienes ninguna carta coleccionable ni predicción dorada para ofrecer en el mercado general en este momento.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
