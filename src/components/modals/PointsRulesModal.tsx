import React from 'react';
import { Trophy, Star, Zap, Clock, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PointsRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PointsRulesModal: React.FC<PointsRulesModalProps> = ({ isOpen, onClose }) => {
    const rules = [
        {
            icon: <Trophy className="text-amber-500" />,
            title: "Acierto Base",
            points: "+3 Puntos",
            desc: "Puntas si aciertas quién gana el partido (Local/Visitante) o si termina en empate."
        },
        {
            icon: <Star className="text-blue-500" />,
            title: "Pleno Exacto",
            points: "+2 Puntos Adicionales",
            desc: "Si además aciertas el marcador numérico exacto (ej. 2-1), sumas un bono de precisión."
        },
        {
            icon: <Zap className="text-purple-500" />,
            title: "Modo Eliminatoria",
            points: "+1 Punto Extra",
            desc: "En octavos, cuartos, semis y final: acierta si se define en 90', Prórroga o Penales."
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0F131A] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-8 pb-4 relative">
                            <button 
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Info className="text-blue-500" size={20} />
                                </div>
                                <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Sistema de Puntuación</h2>
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Cómo ganar puntos</h3>
                        </div>

                        {/* Rules List */}
                        <div className="p-8 pt-0 space-y-4">
                            {rules.map((rule, idx) => (
                                <div 
                                    key={idx}
                                    className="flex items-start gap-4 p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
                                >
                                    <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                                        {rule.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{rule.title}</h4>
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                                                {rule.points}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                                            {rule.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer Tips */}
                        <div className="p-8 bg-white/5 border-t border-white/5">
                            <div className="flex items-start gap-3">
                                <Clock size={16} className="text-zinc-600 mt-1 shrink-0" />
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                                    Los puntos se actualizan automáticamente al finalizar el partido. En modo Eliminatorias, el máximo por partido es de <span className="text-white">6 puntos</span>.
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-full mt-6 py-4 bg-white text-black font-black uppercase text-xs rounded-2xl hover:bg-zinc-200 transition-all active:scale-95"
                            >
                                Entendido
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
