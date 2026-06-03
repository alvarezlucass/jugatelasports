import React from 'react';
import { ArrowLeft, Target, Trophy, Zap, Coins, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RulesPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-zinc-300">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-3xl font-black text-white mb-8 tracking-tight uppercase">Reglas del Juego</h1>
            
            <div className="space-y-8">
                
                {/* Sistema 3-2-1 */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-primary/20 p-2 rounded-xl">
                            <Target className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">El Motor 3-2-1 (Puntaje)</h2>
                    </div>
                    <p className="text-sm mb-4">
                        Jugatela Sports utiliza un sistema clásico y balanceado para recompensar tu precisión al pronosticar partidos:
                    </p>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="bg-green-500/20 text-green-400 font-black px-2 py-0.5 rounded text-xs mt-0.5 shrink-0">3 PTS</span>
                            <span><strong>Acierto Exacto:</strong> Adivinas el resultado exacto del partido (Ej: Pronosticas 2-1 y termina 2-1).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded text-xs mt-0.5 shrink-0">2 PTS</span>
                            <span><strong>Acierto de Diferencia:</strong> Adivinas qué equipo gana (o empate) y la diferencia de goles exacta (Ej: Pronosticas 2-0 y termina 3-1).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-blue-500/20 text-blue-400 font-black px-2 py-0.5 rounded text-xs mt-0.5 shrink-0">1 PT</span>
                            <span><strong>Acierto de Tendencia:</strong> Adivinas quién gana o si hay empate, pero erras los goles (Ej: Pronosticas 1-0 y termina 4-0).</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="bg-red-500/20 text-red-400 font-black px-2 py-0.5 rounded text-xs mt-0.5 shrink-0">0 PTS</span>
                            <span><strong>Fallo:</strong> Gana el equipo contrario al que elegiste, o pronosticaste un ganador y hay empate.</span>
                        </li>
                    </ul>
                </section>

                {/* Tokens PKTS */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-amber-500/20 p-2 rounded-xl">
                            <Coins className="w-6 h-6 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Los Tokens (PKTS)</h2>
                    </div>
                    <p className="text-sm mb-4">
                        Toda jugada requiere una pequeña inversión de <strong>PKTS</strong> (la moneda virtual del juego). 
                        Dependiendo de tus aciertos, estos PKTS se multiplicarán:
                    </p>
                    <ul className="space-y-3 text-sm">
                        <li><strong>Multiplicadores:</strong> Un acierto de 3 puntos multiplica tus tokens x3. Un acierto de 1 punto te devuelve lo invertido (x1). Un fallo hace que pierdas los tokens jugados.</li>
                        <li><strong>Bonus Diarios:</strong> Puedes obtener tokens gratis todos los días al iniciar sesión, completando rachas, o participando en eventos especiales.</li>
                    </ul>
                </section>

                {/* Retos PvP */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-500/20 p-2 rounded-xl">
                            <Zap className="w-6 h-6 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Arena PvP y Boosters</h2>
                    </div>
                    <div className="space-y-4 text-sm">
                        <p>
                            Además de predecir de forma solitaria, puedes lanzar <strong>Retos PvP (Jugador vs Jugador)</strong> 
                            a tus amigos o a nuestros bots de IA. Quien sume más puntos en el partido (basado en el motor 3-2-1) 
                            se lleva el pozo de tokens acumulado. En caso de empate en puntos, se devuelve la inversión a ambos.
                        </p>
                        <p>
                            También puedes comprar <strong>Boosters</strong> en la Tienda usando tus PKTS. Estos modificadores se aplican a 
                            tus jugadas individuales para proteger tu inversión (Seguros) o multiplicar tus ganancias si estás muy seguro de un resultado.
                        </p>
                    </div>
                </section>

                {/* Rankings */}
                <section className="bg-white/5 border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-500/20 p-2 rounded-xl">
                            <Trophy className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Grupos y Rankings</h2>
                    </div>
                    <p className="text-sm">
                        Puedes crear <strong>Grupos Privados</strong> con tus amigos para competir en tablas de posiciones exclusivas. 
                        A su vez, tus puntos te harán subir o bajar en el <strong>Ranking Global</strong> general. 
                        Mantén una alta efectividad para presumir tu puesto frente a miles de usuarios.
                    </p>
                </section>

            </div>
        </div>
    );
};
