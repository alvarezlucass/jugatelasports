import React, { useState } from 'react';
import { MOCK_REWARDS } from '../data/mockData';
import { RewardCard } from '../components/ui/RewardCard';
import { useUser } from '../contexts/UserContext';
import type { Reward } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { SectionHeader } from '../components/ui/SectionHeader';

export const Store: React.FC = () => {
    const { redeemReward } = useUser();
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [filter, setFilter] = useState('All');

    const handleRedeem = (reward: Reward) => {
        if (confirm(`Confirm redeem "${reward.name}" for ${reward.cost} tokens?`)) {
            redeemReward(reward);
            setSuccessMsg(`Successfully redeemed ${reward.name}! Check your email.`);
            setTimeout(() => setSuccessMsg(null), 4000);
        }
    };

    const categories = ['All', 'Digital', 'Physical', 'Premium'];
    const filteredRewards = filter === 'All' ? MOCK_REWARDS : MOCK_REWARDS.filter(r => r.category === filter.toUpperCase() || (filter === 'Physical' && r.category === 'PHYSICAL')); // Adjust logic as needed

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Store</h1>
                    <p className="text-muted-foreground">Redeem your tokens for real rewards.</p>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    <ShoppingBag className="w-8 h-8 text-amber-500" />
                </div>
            </div>

            {/* Categories Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === cat
                                ? 'bg-foreground text-background shadow-lg'
                                : 'bg-card text-muted-foreground border border-border hover:bg-muted'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Rewards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredRewards.map(reward => (
                    <RewardCard
                        key={reward.id}
                        reward={reward}
                        onRedeem={handleRedeem}
                    />
                ))}
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 min-w-[300px]"
                    >
                        <CheckCircle className="w-6 h-6 flex-shrink-0" />
                        <p className="text-sm font-bold">{successMsg}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
