import React, { useState } from 'react';
import { Trophy, Shield, KeyRound, X, Users, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'create' | 'join';
}

export const GroupModal: React.FC<GroupModalProps> = ({ isOpen, onClose, initialMode = 'create' }) => {
    const [mode, setMode] = useState<'create' | 'join'>(initialMode);
    const [groupName, setGroupName] = useState('');
    const [groupColor, setGroupColor] = useState('blue');
    const [joinPin, setJoinPin] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    const navigate = useNavigate();

    const colors = [
        { id: 'blue', class: 'bg-blue-600', shadow: 'shadow-blue-500/50' },
        { id: 'green', class: 'bg-green-600', shadow: 'shadow-green-500/50' },
        { id: 'purple', class: 'bg-purple-600', shadow: 'shadow-purple-500/50' },
        { id: 'rose', class: 'bg-rose-600', shadow: 'shadow-rose-500/50' },
        { id: 'amber', class: 'bg-amber-600', shadow: 'shadow-amber-500/50' },
    ];

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here we would typically make an API call to create or join the group
        // For now, we simulate success and redirect to a mock group view
        setTimeout(() => {
            onClose();
            // Redirect to a placeholder new group ID
            navigate('/groups/new-group-123');
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-[#0F131A] border border-white/10 rounded-[2.5rem] p-6 md:p-8 animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1.5 rounded-2xl mb-8 w-fit mx-auto">
                    <button
                        onClick={() => setMode('create')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all",
                            mode === 'create'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Crear Liga
                    </button>
                    <button
                        onClick={() => setMode('join')}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all",
                            mode === 'join'
                                ? "bg-white text-black shadow-lg"
                                : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        Unirse con PIN
                    </button>
                </div>

                <div className="overflow-y-auto no-scrollbar flex-1 pb-4">
                    {mode === 'create' ? (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">
                                        Nombre de la Liga
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Ej: Los Pibes del Fulbo"
                                        className="w-full mt-2 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-white font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4">
                                        Color del Grupo
                                    </label>
                                    <div className="flex gap-3 mt-3 px-2">
                                        {colors.map(c => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setGroupColor(c.id)}
                                                className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                                                    c.class,
                                                    groupColor === c.id ? `ring-2 ring-white ring-offset-4 ring-offset-[#0F131A] scale-110 shadow-lg ${c.shadow}` : "opacity-50 hover:opacity-100 hover:scale-105"
                                                )}
                                            >
                                                {groupColor === c.id && <Trophy size={20} className="text-white drop-shadow-md" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-4 mb-3 block">
                                        Privacidad
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsPublic(false)}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all text-left flex flex-col gap-2",
                                                !isPublic
                                                    ? "bg-blue-600/10 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                                                    : "bg-black/50 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                                            )}
                                        >
                                            <Shield size={24} className={!isPublic ? "text-blue-400" : ""} />
                                            <div>
                                                <div className="font-bold text-sm">Privado</div>
                                                <div className="text-xs opacity-70">Sólo con PIN</div>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPublic(true)}
                                            className={cn(
                                                "p-4 rounded-2xl border transition-all text-left flex flex-col gap-2",
                                                isPublic
                                                    ? "bg-green-600/10 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                                    : "bg-black/50 border-white/5 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                                            )}
                                        >
                                            <Users size={24} className={isPublic ? "text-green-400" : ""} />
                                            <div>
                                                <div className="font-bold text-sm">Público</div>
                                                <div className="text-xs opacity-70">Cualquiera puede unirse</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!groupName.trim()}
                                className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-wider hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-8"
                            >
                                Crear Liga Ahora
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-left-4 pt-4">
                            <div className="text-center space-y-4 mb-8">
                                <div className="w-20 h-20 bg-purple-600/20 border-2 border-purple-500/50 rounded-full flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                    <KeyRound size={32} strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                                        Ingresa el PIN
                                    </h3>
                                    <p className="text-zinc-500 font-bold max-w-xs mx-auto text-sm mt-2">
                                        Pídele al administrador de la liga el código secreto para unirte.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    required
                                    value={joinPin}
                                    onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
                                    placeholder="Ej: X9A2B"
                                    className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-white font-black text-2xl text-center tracking-[0.3em] uppercase focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-zinc-800"
                                    maxLength={8}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={joinPin.length < 4}
                                className="w-full py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-wider hover:bg-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(168,85,247,0.3)] shadow-purple-600/20 disabled:shadow-none"
                            >
                                Unirse a la Liga
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
