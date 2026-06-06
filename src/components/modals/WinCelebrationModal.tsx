import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Coins } from 'lucide-react';

interface WinCelebrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalTokens: number;
    winCount: number;
}

export const WinCelebrationModal: React.FC<WinCelebrationModalProps> = ({ isOpen, onClose, totalTokens, winCount }) => {
    useEffect(() => {
        if (isOpen) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function() {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({
                    ...defaults, particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults, particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-[#1A1F2C] to-[#0F131A] border border-yellow-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                    >
                        {/* Glow Effects */}
                        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-yellow-500/20 to-transparent" />
                        
                        <div className="p-8 text-center relative z-10">
                            <motion.div 
                                initial={{ rotate: -10, scale: 0.9 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/30"
                            >
                                <Trophy className="w-10 h-10 text-black fill-black/20" />
                            </motion.div>

                            <motion.h2 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 mb-2 uppercase tracking-tight"
                            >
                                ¡Felicidades!
                            </motion.h2>

                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="text-zinc-300 text-sm font-medium mb-8"
                            >
                                Has acertado {winCount} {winCount === 1 ? 'jugada' : 'jugadas'} y ganaste:
                            </motion.p>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.5 }}
                                className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 mb-8"
                            >
                                <Coins className="w-8 h-8 text-amber-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                                <span className="text-4xl font-black text-white tracking-tight">
                                    +{totalTokens}
                                </span>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                onClick={onClose}
                                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)]"
                            >
                                Increíble
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
