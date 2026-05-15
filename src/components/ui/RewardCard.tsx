import React from 'react';
import type { Reward } from '../../types';
import { Coins, Tag } from 'lucide-react';

interface RewardCardProps {
    reward: Reward;
    onRedeem: (reward: Reward) => void;
}

export const RewardCard: React.FC<RewardCardProps> = ({ reward, onRedeem }) => {
    return (
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group flex flex-col h-full">
            <div className="relative h-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{reward.category}</span>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex-1">
                    <h3 className="font-bold text-foreground text-sm mb-1 leading-tight">{reward.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{reward.description}</p>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/30">
                    <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-sm font-bold text-amber-500">{reward.cost}</span>
                    </div>

                    <button
                        onClick={() => onRedeem(reward)}
                        className="bg-primary hover:bg-primary/90 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
                    >
                        Redeem
                    </button>
                </div>
            </div>
        </div>
    );
};
