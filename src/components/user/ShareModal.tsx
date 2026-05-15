import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Send, Share2, Globe, MessageCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    shareUrl: string;
    title?: string;
}

export const ShareModal: React.FC<Props> = ({ isOpen, onClose, shareUrl, title = "¡Mira mi predicción del Mundial!" }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareSocial = (platform: 'twitter' | 'whatsapp' | 'telegram') => {
        let url = '';
        const text = encodeURIComponent(title);
        const link = encodeURIComponent(shareUrl);

        switch (platform) {
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${text}&url=${link}`;
                break;
            case 'whatsapp':
                url = `https://api.whatsapp.com/send?text=${text}%20${link}`;
                break;
            case 'telegram':
                url = `https://t.me/share/url?url=${link}&text=${text}`;
                break;
        }
        window.open(url, '_blank', 'width=600,height=400');
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Mi Predicción Mundial 2026',
                    text: title,
                    url: shareUrl,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            handleCopy();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-[#0F131A] border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Comparte tu Llave</h3>
                                <button 
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <p className="text-zinc-400 text-sm font-bold mb-8 leading-relaxed">
                                Invita a tus amigos a ver tu predicción o a intentar superar tus resultados. 
                                ¡El camino a la final ya está trazado!
                            </p>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 p-4 bg-black/40 rounded-2xl border border-white/5 group">
                                    <Globe className="text-blue-500 shrink-0" size={18} />
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={shareUrl}
                                        className="bg-transparent border-none text-xs font-mono text-zinc-500 w-full focus:ring-0 cursor-default"
                                    />
                                    <button 
                                        onClick={handleCopy}
                                        className={cn(
                                            "shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            copied ? "bg-green-600 text-white" : "bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white"
                                        )}
                                    >
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-8">
                                <button 
                                    onClick={() => shareSocial('whatsapp')}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-green-600/10 border border-green-500/20 hover:bg-green-600/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-600/20 group-hover:scale-110 transition-transform">
                                        <MessageCircle size={20} fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] font-black text-green-500 uppercase">WhatsApp</span>
                                </button>

                                <button 
                                    onClick={() => shareSocial('twitter')}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <Twitter size={20} fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Twitter</span>
                                </button>

                                <button 
                                    onClick={() => shareSocial('telegram')}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                        <Send size={20} fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-500 uppercase">Telegram</span>
                                </button>

                                <button 
                                    onClick={handleNativeShare}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-zinc-800/50 border border-white/5 hover:bg-zinc-800 transition-all group"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                                        <Share2 size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase">Más</span>
                                </button>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl transition-all border border-white/5"
                            >
                                Cerrar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
