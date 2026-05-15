import React, { useState } from 'react';
import type { Match, PredictionOutcome } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertCircle } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';
import { useGame } from '../../contexts/GameContext';

interface PredictionModalProps {
    match: Match | null;
    selection: PredictionOutcome | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PredictionModal: React.FC<PredictionModalProps> = ({ match, selection, isOpen, onClose }) => {
    const { user, canAfford } = useUser();
    const { placePrediction } = useGame();
    const [stake, setStake] = useState<number>(100);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen || !match || !selection) return null;

    const odds = match.odds[selection.toLowerCase() as keyof typeof match.odds];
    const teamName = selection === 'HOME' ? match.homeTeam.name : selection === 'AWAY' ? match.awayTeam.name : 'Empate';
    const potentialWin = Math.floor(stake * odds);

    const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        setStake(isNaN(val) ? 0 : val);
        setError(null);
    };

    const handleQuickStake = (amount: number) => {
        setStake(amount);
        setError(null);
    };

    const handleSubmit = () => {
        if (stake <= 0) return setError("Ingresa un monto válido");
        if (!canAfford(stake)) return setError("No tienes suficientes tokens");

        const result = placePrediction(match.id, selection, stake);
        if (result) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setStake(100);
            }, 1500);
        } else {
            setError("Error al realizar la predicción");
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    className="bg-gray-900 w-full max-w-sm rounded-t-2xl sm:rounded-2xl border border-gray-800 shadow-2xl overflow-hidden"
                >
                    {success ? (
                        <div className="p-8 flex flex-col items-center text-center space-y-4 bg-green-900/20">
                            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">¡Predicción Enviada!</h3>
                            <p className="text-gray-300">Si {teamName} gana, recibirás <span className="text-amber-400 font-bold">{potentialWin} tokens</span>.</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                                <h3 className="font-bold text-lg">Confirmar Jugada</h3>
                                <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-800">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-6">

                                {/* Selection Info */}
                                <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-xl border border-gray-700">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Tu selección</span>
                                        <span className="font-bold text-lg text-primary">{teamName}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider">Multiplicador</span>
                                        <span className="font-mono font-bold text-xl text-white">x{odds.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Stake Input */}
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-400 flex justify-between">
                                        <span>Monto a apostar</span>
                                        <span className={cn("text-xs", (user?.tokens || 0) < stake ? "text-red-400" : "text-gray-500")}>
                                            Disponible: {user?.tokens || 0}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={stake}
                                            onChange={handleStakeChange}
                                            className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-2xl font-bold text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-center"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-bold">TOKENS</span>
                                    </div>

                                    {/* Quick Amounts */}
                                    <div className="flex gap-2 justify-center">
                                        {[50, 100, 500, 1000].map(amt => (
                                            <button
                                                key={amt}
                                                onClick={() => handleQuickStake(amt)}
                                                className="px-3 py-1 bg-gray-800 rounded-lg text-xs font-bold text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                                            >
                                                {amt}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Potential Win */}
                                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 flex justify-between items-center group">
                                    <span className="text-sm text-gray-400">Ganancia Potencial</span>
                                    <span className="text-xl font-bold text-amber-400 flex items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        {potentialWin}
                                    </span>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                {/* Confirm Button */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!canAfford(stake) || stake <= 0}
                                    className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    ¡Jugátela!
                                </button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
