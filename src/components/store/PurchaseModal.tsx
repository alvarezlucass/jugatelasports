import React, { useState } from 'react';
import type { StoreItem } from '../../types';
import { X, CheckCircle, Info, MessageSquare, Copy, ExternalLink } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface PurchaseModalProps {
    item: StoreItem;
    onClose: () => void;
    onConfirm: (item: StoreItem) => Promise<{ success: boolean; transactionId?: string }>;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ item, onClose, onConfirm }) => {
    const { user } = useUser();
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [trackId, setTrackId] = useState<string | null>(null);

    const handleConfirm = async () => {
        setIsPurchasing(true);
        const result = await onConfirm(item);
        if (result.success) {
            setTrackId(result.transactionId || null);
            setSuccess(true);
        } else {
            setIsPurchasing(false);
        }
    };

    const handleWhatsAppCoordination = () => {
        const userName = user?.name || user?.nickname || 'Usuario';
        const shortTrackId = trackId?.slice(0, 8).toUpperCase() || 'N/A';
        const message = encodeURIComponent(
            `¡Hola Jugátela! 🪙\n\nQuiero coordinar la entrega de mi premio.\n\n👤 *Usuario:* ${userName}\n📦 *Premio:* ${item.name}\n🔢 *ID de Rastreo:* ${shortTrackId}\n\nDejo este mensaje para coordinar la entrega. ¡Gracias!`
        );
        window.open(`https://wa.me/5491122620697?text=${message}`, '_blank');
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-[#0F1216] w-full max-w-sm rounded-[2.5rem] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative">
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-${item.color}-500/10 blur-[80px] pointer-events-none`} />

                <div className="p-8 relative z-10">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h2 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Operación Segura</h2>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-zinc-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {!success ? (
                        <>
                            <div className="text-center mb-8">
                                <div className={`w-20 h-20 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-${item.color}-500/20 rotate-3`}>
                                    {item.category === 'especias' ? (
                                        <span className="text-4xl">🍹</span>
                                    ) : (
                                        <Info className="w-10 h-10 text-white fill-current" />
                                    )}
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{item.name}</h3>
                                <p className="text-zinc-500 text-xs font-medium px-4">{item.description}</p>
                            </div>

                            <div className="bg-black/40 rounded-3xl p-5 flex justify-between items-center mb-6 border border-white/5 shadow-inner">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inversión Final</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🪙</span>
                                    <span className="text-2xl font-black text-white tracking-tighter">{item.price.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Beautiful Alert Disclaimer */}
                            <div className="bg-blue-500/5 backdrop-blur-md rounded-2xl p-4 border border-blue-500/10 mb-8 flex gap-3 group transition-all hover:bg-blue-500/10 hover:border-blue-500/20">
                                <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] leading-tight text-zinc-400 font-bold uppercase tracking-tight">
                                        Tokens no canjeables por premios reales ni dinero.
                                    </p>
                                    <button type="button" className="text-[9px] text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 flex items-center gap-1 transition-colors">
                                        Términos Legales <ExternalLink size={10} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={isPurchasing}
                                    className={`flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center active:scale-95 ${isPurchasing ? 'opacity-50' : ''}`}
                                >
                                    {isPurchasing ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Confirmar Pago'
                                    )}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 relative">
                                <CheckCircle className="w-12 h-12 text-emerald-500" />
                                <div className="absolute inset-0 bg-emerald-500/10 rounded-[2.5rem] animate-ping" />
                            </div>
                            
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">¡Canje Exitoso!</h3>
                            <p className="text-zinc-500 text-xs font-medium mb-8 px-6">
                                Tu pedido ha sido procesado. Debes coordinar la entrega ahora.
                            </p>

                            <div className="bg-black/60 rounded-[2rem] p-6 border border-white/5 mb-8 text-left space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest px-1">ID de Rastreo</span>
                                    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 group">
                                        <code className="text-xs font-mono text-emerald-400 font-bold">{trackId?.slice(0, 12).toUpperCase()}...</code>
                                        <Copy size={12} className="text-zinc-600 group-hover:text-zinc-400 cursor-pointer transition-colors" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleWhatsAppCoordination}
                                className="w-full py-5 rounded-[2rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.1em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95 group"
                            >
                                <MessageSquare size={18} className="fill-current group-hover:rotate-12 transition-transform" />
                                Coordinar Entrega
                            </button>
                            
                            <p className="mt-6 text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic leading-relaxed">
                                Deja el mensaje en WhatsApp y pronto<br />podremos coordinar tu entrega personalizada.
                            </p>

                            <button onClick={onClose} className="mt-8 text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors">
                                Volver a la Tienda
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

