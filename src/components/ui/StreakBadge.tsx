import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export const StreakBadge: React.FC = () => {
    const [streak, setStreak] = useState(1);

    useEffect(() => {
        const lastLoginDate = localStorage.getItem('last_login_date');
        const currentStreak = parseInt(localStorage.getItem('current_streak') || '0');
        const today = new Date().toISOString().split('T')[0];

        if (lastLoginDate === today) {
            setStreak(currentStreak || 1);
        } else if (lastLoginDate) {
            const lastDate = new Date(lastLoginDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays === 1) {
                // Consecutive day
                const newStreak = currentStreak + 1;
                setStreak(newStreak);
                localStorage.setItem('current_streak', newStreak.toString());
            } else {
                // Streak broken
                setStreak(1);
                localStorage.setItem('current_streak', '1');
            }
            localStorage.setItem('last_login_date', today);
        } else {
            // First time
            setStreak(1);
            localStorage.setItem('current_streak', '1');
            localStorage.setItem('last_login_date', today);
        }
    }, []);

    return (
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3 py-1.5 rounded-full cursor-pointer hover:bg-orange-500/20 transition-colors"
            title={`Racha de ${streak} días seguidos`}
        >
            <Flame className={`w-4 h-4 ${streak > 2 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-orange-500'}`} />
            <span className="font-black text-sm text-orange-500 tracking-tight">{streak}</span>
        </motion.div>
    );
};
