import React from 'react';
import { ArrowLeft, Target, Coins, Swords, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DisclaimerPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl text-zinc-300">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 font-bold text-sm uppercase tracking-widest">
                <ArrowLeft size={16} /> Volver
            </button>
            <h1 className="text-3xl font-black text-white mb-8 tracking-tight uppercase flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" /> Juego Responsable
            </h1>
            
            <div className="space-y-6 text-sm leading-relaxed">
                
                <div className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-r-2xl">
                    <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Plataforma Free-to-Play</h2>
                    <p className="text-red-200/90 text-base font-medium">
                        Jugatela Sports es un juego diseñado puramente para la diversión, la estrategia y la interacción social. 
                        <strong> NO es una plataforma de juegos de azar, casino, ni apuestas deportivas con dinero real.</strong>
                    </p>
                </div>

                <section className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-start gap-4">
                        <Coins className="w-8 h-8 text-amber-500 shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Naturaleza de los Tokens (PKTS)</h3>
                            <p>
                                Toda moneda virtual, token (PKTS) o puntos obtenidos dentro de la plataforma son 
                                elementos de juego virtual. <strong>Estos tokens no tienen, ni tendrán, valor monetario real.</strong> 
                                No se pueden retirar, transferir a billeteras externas, ni canjear por dinero fiduciario o criptoactivos de ningún tipo.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                        <Target className="w-8 h-8 text-blue-500 shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">El Objetivo: Diversión y Ranking</h3>
                            <p>
                                El objetivo de Jugatela Sports es demostrar tus conocimientos futbolísticos pronosticando 
                                resultados, escalar en las tablas de clasificación mundiales (Rankings) y competir amistosamente 
                                con amigos y la comunidad.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                        <Swords className="w-8 h-8 text-red-500 shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-white mb-1">Límite de Edad</h3>
                            <p>
                                Aunque no somos un sitio de apuestas, por razones de seguridad digital e interacción en la comunidad, 
                                la plataforma está diseñada para ser utilizada por personas mayores de 13 años. Si descubrimos que un menor ha 
                                creado una cuenta falsificando información, será eliminada inmediatamente.
                            </p>
                        </div>
                    </div>
                </section>
                
                <p className="text-center text-xs text-zinc-500 mt-8 font-medium">
                    Al utilizar Jugatela Sports, reconoces y aceptas la naturaleza gratuita y virtual de este simulador deportivo.
                </p>
            </div>
        </div>
    );
};
