import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Activity, Calendar } from 'lucide-react';
import { LiveStandings } from '../components/competition/LiveStandings';
import { LEAGUE_IDS } from '../lib/leagues';

const CATEGORIES = [
    {
        id: 'EUROPE', name: 'Europa', icon: Trophy, leagues: [
            { id: LEAGUE_IDS.UEFA_CHAMPIONS_LEAGUE, name: 'Champions League', country: 'UEFA' },
            { id: LEAGUE_IDS.SPAIN_LA_LIGA, name: 'La Liga', country: 'España' },
            { id: LEAGUE_IDS.UEFA_EURO, name: 'Euro 2024', country: 'UEFA' }
        ]
    },
    {
        id: 'AMERICA', name: 'América', icon: Activity, leagues: [
            { id: LEAGUE_IDS.ARGENTINA_LIGA_PROFESIONAL, name: 'Liga Profesional', country: 'Argentina' },
            { id: LEAGUE_IDS.ARGENTINA_PRIMERA_B, name: 'Primera B Nacional', country: 'Argentina' },
            { id: LEAGUE_IDS.COPA_AMERICA, name: 'Copa América', country: 'CONMEBOL' }
        ]
    }
];

export const LiveCompetitions: React.FC = () => {
    const [selectedLeague, setSelectedLeague] = useState(LEAGUE_IDS.ARGENTINA_LIGA_PROFESIONAL);
    const [activeTab, setActiveTab] = useState<'standings' | 'matches'>('standings');

    const currentLeagueName = [...CATEGORIES[0].leagues, ...CATEGORIES[1].leagues].find(l => l.id === selectedLeague)?.name;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-black">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="max-w-7xl mx-auto relative">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-4 mb-4"
                    >
                        <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/20">
                            <Activity className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-white tracking-tight">Competiciones en Vivo</h1>
                            <p className="text-gray-400 mt-1">Explora posiciones, resultados y estadísticas en tiempo real.</p>
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                        {CATEGORIES.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center space-x-2 text-gray-400 px-2 uppercase tracking-widest text-xs font-bold">
                                    <cat.icon className="w-4 h-4" />
                                    <span>{cat.name}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cat.leagues.map((league) => (
                                        <button
                                            key={league.id}
                                            onClick={() => setSelectedLeague(league.id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 border
                        ${selectedLeague === league.id
                                                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                                                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            {league.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </header>

                <div className="flex space-x-6 mb-8 border-b border-white/10 px-2">
                    <button
                        onClick={() => setActiveTab('standings')}
                        className={`pb-4 text-sm font-bold tracking-wider transition-all relative
              ${activeTab === 'standings' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        TABLA DE POSICIONES
                        {activeTab === 'standings' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`pb-4 text-sm font-bold tracking-wider transition-all relative
              ${activeTab === 'matches' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        PARTIDOS Y RESULTADOS
                        {activeTab === 'matches' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400" />
                        )}
                    </button>
                </div>

                <main>
                    {/* Data Saver Mode Warning */}
                    <div className="mb-8 flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                        <div className="flex items-center space-x-3">
                            <Activity className="w-5 h-5 text-yellow-500" />
                            <div>
                                <p className="text-sm font-bold text-white">Modo Ahorro: {localStorage.getItem('api_suspended') === 'true' ? 'ACTIVADO' : 'DESACTIVADO'}</p>
                                <p className="text-xs text-gray-400">Actualización automática pausada.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const current = localStorage.getItem('api_suspended') === 'true';
                                localStorage.setItem('api_suspended', (!current).toString());
                                window.location.reload();
                            }}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-xl transition-all"
                        >
                            {localStorage.getItem('api_suspended') === 'true' ? 'Activar' : 'Pausar'}
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'standings' ? (
                            <div key="standings">
                                <div className="mb-6 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                                        <Trophy className="w-5 h-5 text-yellow-500" />
                                        <span>Posiciones: {currentLeagueName}</span>
                                    </h2>
                                </div>
                                <LiveStandings leagueId={selectedLeague} />
                            </div>
                        ) : (
                            <div key="matches" className="p-12 text-center bg-white/5 rounded-2xl border border-white/10">
                                <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-white">Próximos Partidos</h3>
                                <p className="text-gray-400 mt-2">Pronto integraremos el calendario completo para {currentLeagueName}.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};
