import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, ArrowRight } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';

interface BettingSlipProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (stake: number) => Promise<void>;
    selection: {
        type: 'HOME' | 'DRAW' | 'AWAY';
        odds: number;
        matchTitle: string;
    } | null;
}

export const BettingSlip: React.FC<BettingSlipProps> = ({ isOpen, onClose, onConfirm, selection }) => {
    const { user } = useUser();
    const [stake, setStake] = useState<number>(100);
    const [isLoading, setIsLoading] = useState(false);

    if (!selection) return null;

    const potentialReturn = Math.floor(stake * selection.odds);
    const canAfford = (user?.tokens || 0) >= stake;

    const handleConfirm = async () => {
        if (!canAfford) return;
        setIsLoading(true);
        await onConfirm(stake);
        setIsLoading(false);
        onClose();
    };

    // Quick stakes presets
    const presets = [50, 100, 500, 1000];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />

                    {/* Slip */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-6 rounded-t-3xl shadow-2xl max-w-md mx-auto"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-lg font-black text-foreground">Confirmar Jugada</h3>
                                <p className="text-sm text-muted-foreground">{selection.matchTitle}</p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-muted rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Selection Info */}
                        <div className="flex justify-between items-center bg-muted/30 p-4 rounded-xl mb-6 border border-border/50">
                            <div>
                                <span className="text-xs font-bold text-muted-foreground">Tu Selección</span>
                                <div className="text-xl font-black text-primary">
                                    {selection.type === 'HOME' ? 'LOCAL' : selection.type === 'AWAY' ? 'VISITA' : 'EMPATE'}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-bold text-muted-foreground">Cuota</span>
                                <div className="text-xl font-black text-foreground">{selection.odds.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Stake Input */}
                        <div className="space-y-4 mb-8">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Monto a apostar</label>
                            <div className="relative">
                                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                                <input
                                    type="number"
                                    value={stake}
                                    onChange={(e) => setStake(Number(e.target.value))}
                                    className="w-full bg-muted/20 border border-border rounded-xl py-4 pl-12 pr-4 text-2xl font-black text-foreground focus:outline-none focus:border-primary transition-all"
                                />
                            </div>

                            {/* Presets */}
                            <div className="flex gap-2 justify-center">
                                {presets.map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setStake(amount)}
                                        className="px-3 py-1 bg-muted/50 rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary & Action */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Retorno Potencial</span>
                                <span className="font-bold text-green-500 flex items-center gap-1">
                                    +{potentialReturn.toLocaleString()} <Coins className="w-3 h-3" />
                                </span>
                            </div>

                            <button
                                disabled={!canAfford || isLoading || stake <= 0}
                                onClick={handleConfirm}
                                className={cn(
                                    "w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 text-lg shadow-lg transition-all",
                                    canAfford
                                        ? "bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/25"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                {isLoading ? 'Procesando...' : (
                                    <>
                                        {canAfford ? '¡Jugátela!' : 'Saldo Insuficiente'}
                                        {canAfford && <ArrowRight className="w-6 h-6" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
