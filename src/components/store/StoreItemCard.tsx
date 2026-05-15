import React from 'react';
import type { StoreItem } from '../../types';
import { Wine, Flame, Beer, Zap, Shield, Gift } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StoreItemCardProps {
    item: StoreItem;
    onPurchase: (item: StoreItem) => void;
    disabled?: boolean;
}

const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
        case 'Wine': return <Wine className={className} />;
        case 'Flame': return <Flame className={className} />;
        case 'Beer': return <Beer className={className} />;
        case 'Zap': return <Zap className={className} />;
        case 'Shield': return <Shield className={className} />;
        default: return <Gift className={className} />;
    }
};

const getColorClasses = (color: string) => {
    const map: Record<string, { bgOuter: string, bgInner: string, borderInner: string, icon: string, btn: string, btnHover: string, btnShadow: string }> = {
        purple: { bgOuter: 'bg-purple-600/10', bgInner: 'bg-purple-500/20', borderInner: 'border-purple-500/30', icon: 'text-purple-400', btn: 'bg-purple-600', btnHover: 'hover:bg-purple-500', btnShadow: 'shadow-purple-500/20' },
        red: { bgOuter: 'bg-red-600/10', bgInner: 'bg-red-500/20', borderInner: 'border-red-500/30', icon: 'text-red-400', btn: 'bg-red-600', btnHover: 'hover:bg-red-500', btnShadow: 'shadow-red-500/20' },
        amber: { bgOuter: 'bg-amber-600/10', bgInner: 'bg-amber-500/20', borderInner: 'border-amber-500/30', icon: 'text-amber-400', btn: 'bg-amber-600', btnHover: 'hover:bg-amber-500', btnShadow: 'shadow-amber-500/20' },
        blue: { bgOuter: 'bg-blue-600/10', bgInner: 'bg-blue-500/20', borderInner: 'border-blue-500/30', icon: 'text-blue-400', btn: 'bg-blue-600', btnHover: 'hover:bg-blue-500', btnShadow: 'shadow-blue-500/20' },
        green: { bgOuter: 'bg-green-600/10', bgInner: 'bg-green-500/20', borderInner: 'border-green-500/30', icon: 'text-green-400', btn: 'bg-green-600', btnHover: 'hover:bg-green-500', btnShadow: 'shadow-green-500/20' },
    };
    return map[color] || map.blue;
};

export const StoreItemCard: React.FC<StoreItemCardProps> = ({ item, onPurchase, disabled }) => {
    const colors = getColorClasses(item.color || 'blue');

    return (
        <div className="bg-[#121820]/80 backdrop-blur-xl w-full rounded-[2.5rem] border border-white/5 overflow-hidden relative group hover:border-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-2 flex flex-col">
            {item.badge && (
                <div className={cn(
                    "absolute top-0 right-0 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl z-20 shadow-lg",
                    colors.btn
                )}>
                    {item.badge}
                </div>
            )}

            {/* Visual Header */}
            <div className={cn("h-48 flex items-center justify-center relative overflow-hidden", colors.bgOuter)}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121820]/95 z-10" />
                <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner border relative z-0", colors.bgInner, colors.borderInner)}>
                    {getIcon(item.icon, cn("w-12 h-12 drop-shadow-2xl transition-transform duration-700 group-hover:-rotate-6 group-hover:scale-110", colors.icon))}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col flex-1 justify-between relative z-20 -mt-6">
                <div>
                    <h3 className="text-xl md:text-2xl font-black text-white mb-3 leading-tight tracking-tight">{item.name}</h3>
                    <p className="text-sm font-medium text-zinc-400 line-clamp-3 leading-relaxed">
                        {item.description}
                    </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                        <span className="text-yellow-500 text-sm">🪙</span>
                        <span className="font-black text-yellow-500 text-lg">{item.price}</span>
                    </div>

                    <button
                        onClick={() => onPurchase(item)}
                        disabled={disabled}
                        className={cn(
                            "px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95",
                            disabled
                                ? 'bg-white/5 text-zinc-600 cursor-not-allowed hidden'
                                : cn("text-white shadow-xl hover:-translate-y-1 hover:shadow-2xl", colors.btn, colors.btnHover, colors.btnShadow)
                        )}
                    >
                        Canjear
                    </button>
                    {disabled && (
                        <button className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-white/5 text-zinc-600 cursor-not-allowed">
                            Sin Saldo
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
