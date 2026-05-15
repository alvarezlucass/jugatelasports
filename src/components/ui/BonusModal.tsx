import React, { useState, useEffect } from 'react';
import { X, Gift, Play, Share2, Users, CheckCircle2, Copy } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { cn } from '../../lib/utils';

interface BonusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BonusModal: React.FC<BonusModalProps> = ({ isOpen, onClose }) => {
    const { 
        user, 
        dailyBonusAvailable, claimDailyBonus, 
        videoBonusAvailable, claimVideoBonus, 
        socialBonusAvailable, claimSocialBonus 
    } = useUser();

    const [activeTab, setActiveTab] = useState<'daily'|'video'|'social'|'referral'>('daily');
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [videoTimeLeft, setVideoTimeLeft] = useState(15);
    const [videoRewardReady, setVideoRewardReady] = useState(false);

    const [isSocialClicked, setIsSocialClicked] = useState(false);

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            setIsVideoPlaying(false);
            setVideoTimeLeft(15);
            setVideoRewardReady(false);
            setIsSocialClicked(false);
        }
    }, [isOpen]);

    // Timer for video
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isVideoPlaying && videoTimeLeft > 0) {
            timer = setTimeout(() => setVideoTimeLeft(prev => prev - 1), 1000);
        } else if (isVideoPlaying && videoTimeLeft === 0) {
            setVideoRewardReady(true);
        }
        return () => clearTimeout(timer);
    }, [isVideoPlaying, videoTimeLeft]);

    if (!isOpen || !user) return null;

    const handleCopyRef = () => {
        navigator.clipboard.writeText(`https://jugatela.com/r/${user.nickname || user.id}`);
    };

    const handleShare = () => {
        setIsSocialClicked(true);
        window.open(`https://twitter.com/intent/tweet?text=¡Súmate a Jugatela Sports y armá tus pronósticos! Registrate acá: https://jugatela.com/r/${user.nickname || user.id}`, '_blank');
    };

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <div className="bg-[#131822] border border-border/50 rounded-2xl md:rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-border/50 bg-[#0F131A]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Gift className="text-primary w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">Bonus Hub</h2>
                        <p className="text-sm text-zinc-400 font-medium">Gana tokens extra mediante misiones</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                {/* Sidebar Menu */}
                <div className="md:w-1/3 border-r border-border/10 bg-[#0A0D12] p-4 space-y-2 overflow-y-auto hidden md:block">
                    {[
                        { id: 'daily', label: 'Bono Diario', icon: Gift, available: dailyBonusAvailable },
                        { id: 'video', label: 'Mirá y Gana', icon: Play, available: videoBonusAvailable },
                        { id: 'social', label: 'Misión Social', icon: Share2, available: socialBonusAvailable },
                        { id: 'referral', label: 'Invitá Amigos', icon: Users, available: true },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 rounded-xl transition-all font-bold text-sm",
                                activeTab === tab.id 
                                    ? "bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </div>
                            {tab.id !== 'referral' && (
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    tab.available ? "bg-green-500 animate-pulse" : "bg-zinc-600"
                                )} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Mobile Menu (Horizontal Scroll) */}
                <div className="md:hidden flex overflow-x-auto no-scrollbar border-b border-border/10 bg-[#0A0D12] p-2 gap-2">
                     {[
                        { id: 'daily', label: 'Diario', icon: Gift, available: dailyBonusAvailable },
                        { id: 'video', label: 'Videos', icon: Play, available: videoBonusAvailable },
                        { id: 'social', label: 'Social', icon: Share2, available: socialBonusAvailable },
                        { id: 'referral', label: 'Amigos', icon: Users, available: true },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-colors",
                                activeTab === tab.id
                                     ? "bg-primary text-white"
                                     : "bg-white/5 text-zinc-400"
                            )}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                            {tab.id !== 'referral' && tab.available && (
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-br from-[#131822] to-[#0A0D12]">
                    
                    {/* Daily Bonus */}
                    {activeTab === 'daily' && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center relative">
                                <Gift className={cn("w-12 h-12 text-amber-500", dailyBonusAvailable && "animate-bounce")} />
                                {dailyBonusAvailable && (
                                    <div className="absolute inset-0 rounded-full border-2 border-amber-500/50 animate-ping" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Recompensa Diaria</h3>
                                <p className="text-zinc-400 mt-2 max-w-xs mx-auto">Vuelve todos los días para reclamar 10 tokens de regalo para apostar.</p>
                            </div>
                            
                            {dailyBonusAvailable ? (
                                <button 
                                    onClick={claimDailyBonus}
                                    className="px-8 py-3 rounded-xl font-black uppercase tracking-wider transition-all bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                >
                                    Cobrar 10 Tokens
                                </button>
                            ) : (
                                <div className="px-6 py-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2 fade-in">
                                    <CheckCircle2 className="w-8 h-8 text-amber-400 mb-1" />
                                    <p className="text-amber-400 font-bold">¡Gracias por volver!</p>
                                    <p className="text-amber-400/80 text-sm">Ya hemos sumado 10 tokens a tu balance. Vuelve mañana.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Video Bonus */}
                    {activeTab === 'video' && (
                        <div className="h-full flex flex-col items-center text-center space-y-6">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Aprende y Gana</h3>
                            <p className="text-zinc-400 text-sm max-w-sm mx-auto">Mira este tutorial de 15 segundos sobre cómo armar grupos para ganar 50 tokens.</p>
                            
                            {!isVideoPlaying && videoBonusAvailable && (
                                <button 
                                    onClick={() => setIsVideoPlaying(true)}
                                    className="relative w-full aspect-video rounded-xl bg-black border border-white/10 overflow-hidden group hover:border-primary/50 transition-colors flex items-center justify-center"
                                >
                                    <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=800" alt="Video cover" className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity object-cover" />
                                    <div className="relative z-10 w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center text-white backdrop-blur-md group-hover:scale-110 transition-transform">
                                        <Play className="fill-white" />
                                    </div>
                                </button>
                            )}

                            {!videoBonusAvailable && (
                                <div className="w-full aspect-video rounded-xl bg-green-500/10 border border-green-500/20 flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95">
                                    <CheckCircle2 className="w-12 h-12 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                    <p className="text-green-400 font-black uppercase text-xl">¡Misión Cumplida!</p>
                                    <p className="text-green-400/80 text-sm font-bold">Se sumaron 50 tokens a tu billetera.</p>
                                </div>
                            )}

                            {isVideoPlaying && videoBonusAvailable && !videoRewardReady && (
                                <div className="w-full space-y-4">
                                    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative border border-primary/20">
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                           <Play className="w-12 h-12 text-primary animate-pulse" />
                                           <p className="font-bold text-white uppercase tracking-widest text-sm animate-pulse">Reproduciendo Tutorial...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-zinc-400 font-medium">
                                        Mira {videoTimeLeft} segundos más para cobrar
                                    </div>
                                </div>
                            )}

                            {videoRewardReady && videoBonusAvailable && (
                                <button 
                                    onClick={() => {
                                        claimVideoBonus();
                                        setIsVideoPlaying(false);
                                    }}
                                    className="w-full px-6 py-4 rounded-xl bg-green-600 text-white font-black uppercase tracking-wider hover:bg-green-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(22,163,74,0.4)] animate-in slide-in-from-bottom"
                                >
                                    ¡Cobrar mis 50 Tokens!
                                </button>
                            )}
                        </div>
                    )}

                    {/* Social Share */}
                    {activeTab === 'social' && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                <Share2 className="w-10 h-10 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Apoyo Social</h3>
                                <p className="text-zinc-400 mt-2 text-sm max-w-sm mx-auto">Ayúdanos a crecer compartiendo Jugatela en X/Twitter. ¡Llevate 100 tokens gratis!</p>
                            </div>
                            
                            {socialBonusAvailable ? (
                                <div className="space-y-4 w-full max-w-xs">
                                    <button 
                                        onClick={handleShare}
                                        className="w-full px-6 py-3 rounded-xl font-bold bg-[#1DA1F2] text-white hover:bg-[#1a91da] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" /> Compartir en X
                                    </button>
                                    
                                    <button 
                                        onClick={claimSocialBonus}
                                        disabled={!isSocialClicked}
                                        className={cn(
                                            "w-full px-6 py-3 rounded-xl font-black uppercase tracking-wider transition-all",
                                            isSocialClicked 
                                                ? "bg-green-600 text-white hover:bg-green-500 shadow-[0_0_20px_rgba(22,163,74,0.4)]"
                                                : "bg-zinc-800 text-zinc-600 cursor-not-allowed border border-white/5 opacity-50"
                                        )}
                                    >
                                        Cobrar 100 Tokens
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full max-w-xs px-6 py-6 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex flex-col items-center gap-3 animate-in slide-in-from-bottom flex-shrink-0">
                                    <CheckCircle2 className="w-10 h-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <div>
                                        <p className="font-black uppercase tracking-wider">¡Tokens Transferidos!</p>
                                        <p className="text-sm font-medium opacity-80 mt-1">&nbsp;+100 añadidos a tu billetera.</p>
                                    </div>
                                    <p className="text-xs text-blue-400/60 mt-2">Vuelve en unos días para repetir.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Referrals */}
                    {activeTab === 'referral' && (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                <Users className="w-10 h-10 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Programa de Referidos</h3>
                                <p className="text-zinc-400 mt-2 text-sm">Gana unos masivos <span className="text-primary font-bold">1000 tokens</span> por cada amigo que se registre usando tu link exacto.</p>
                            </div>
                            
                            <div className="w-full bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                                <code className="text-primary font-mono text-xs md:text-sm truncate">
                                    https://jugatela.com/r/{user.nickname || user.id}
                                </code>
                                <button 
                                    onClick={handleCopyRef}
                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex-shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <p className="text-xs text-zinc-500">
                                Los tokens se acreditarán automáticamente en cuanto tu amigo verifique su cuenta. Es ilimitado y la forma más rápida de crecer.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    </div>
    );
};
