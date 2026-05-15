import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { X, Gift, Users, Swords } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { League } from '../../types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    group: League;
}

export const CreateChallengeModal: React.FC<Props> = ({ isOpen, onClose, group }) => {
    const { user, createChallenge, opponents } = useUser();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [reward, setReward] = useState('');
    const [challengeType, setChallengeType] = useState<'FIXED' | 'POOL'>('FIXED');
    const [entryFee, setEntryFee] = useState<number>(50);
    const [targetId, setTargetId] = useState<string>('all'); // 'all' or user ID

    if (!isOpen) return null;

    // Simulate getting group members to challenge
    const groupMembers = group.memberIds
        .filter(id => id !== user?.id)
        .map(id => {
            const opponent = opponents.find(o => o.id === id);
            return {
                id,
                name: opponent ? opponent.name : `Usuario ${id.substring(0, 4)}`,
            };
        });

    const popularRewards = ['1 Fernet', 'Un Asado', 'Una Cerveza', 'Café', '1000 Tokens'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;
        if (challengeType === 'FIXED' && !reward) return;
        if (challengeType === 'POOL' && (!entryFee || entryFee <= 0)) return;

        const actualReward = challengeType === 'POOL' ? `${entryFee} Tokens (c/u)` : reward;

        const success = await createChallenge({
            groupId: group.id,
            creatorId: user?.id || 'guest',
            targetId: targetId === 'all' ? undefined : targetId,
            title,
            description,
            type: challengeType,
            entryFee: challengeType === 'POOL' ? entryFee : undefined,
            reward: actualReward,
        });

        if (success) {
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setReward('');
            setChallengeType('FIXED');
            setEntryFee(50);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-white/10">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Swords className="text-amber-500" />
                        Nuevo Desafío
                    </h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">¿A quién desafías?</label>
                        <select
                            value={targetId}
                            onChange={(e) => setTargetId(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                        >
                            <option value="all">A todo el grupo (Libre)</option>
                            {groupMembers.map(m => (
                                <option key={m.id} value={m.id}>Mano a mano vs {m.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Título del Desafío</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej. El que menos puntos saque..."
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detalles (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Más contexto sobre la apuesta..."
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none h-20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Detalles (Opcional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Más contexto sobre la apuesta..."
                            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none h-20"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tipo de Premio</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setChallengeType('FIXED')}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all border",
                                    challengeType === 'FIXED' 
                                        ? "bg-amber-500/20 border-amber-500 text-amber-400" 
                                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                )}
                            >
                                Premio Fijo
                            </button>
                            <button
                                type="button"
                                onClick={() => setChallengeType('POOL')}
                                className={cn(
                                    "flex-1 py-2 rounded-xl text-sm font-bold transition-all border",
                                    challengeType === 'POOL' 
                                        ? "bg-amber-500/20 border-amber-500 text-amber-400" 
                                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                )}
                            >
                                Pozo de Tokens
                            </button>
                        </div>
                    </div>

                    {challengeType === 'FIXED' ? (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">¿Qué está en juego?</label>
                            <div className="relative">
                                <Gift className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    type="text"
                                    value={reward}
                                    onChange={(e) => setReward(e.target.value)}
                                    placeholder="Ej. 1 Fernet, Un Asado..."
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
                                    required={challengeType === 'FIXED'}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {popularRewards.map(pop => (
                                    <button
                                        key={pop}
                                        type="button"
                                        onClick={() => setReward(pop)}
                                        className={cn(
                                            "px-3 py-1 text-xs font-bold rounded-lg border transition-colors",
                                            reward === pop
                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                                                : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white"
                                        )}
                                    >
                                        {pop}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider">Entrada al Pozo (Tokens por persona)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-amber-500">T</span>
                                <input
                                    type="number"
                                    min="10"
                                    step="10"
                                    value={entryFee}
                                    onChange={(e) => setEntryFee(parseInt(e.target.value) || 0)}
                                    className="w-full bg-amber-500/10 border border-amber-500/30 rounded-xl pl-10 pr-4 py-3 text-white font-black text-lg focus:outline-none focus:border-amber-500 transition-colors"
                                    required={challengeType === 'POOL'}
                                />
                            </div>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-2">
                                Si alguien acepta este reto, deberá pagar la misma entrada. ¡El ganador se lleva la suma total!
                            </p>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!title || !reward}
                            className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Lanzar Desafío
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
