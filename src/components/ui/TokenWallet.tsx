import React, { useEffect, useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

export const TokenWallet: React.FC<{ className?: string }> = ({ className }) => {
    const { user } = useUser();
    if (!user) return null;

    const [prevTokens, setPrevTokens] = useState(user.tokens);
    const [diff, setDiff] = useState(0);

    useEffect(() => {
        if (user.tokens !== prevTokens) {
            setDiff(user.tokens - prevTokens);
            const timer = setTimeout(() => setDiff(0), 2000);
            setPrevTokens(user.tokens);
            return () => clearTimeout(timer);
        }
    }, [user.tokens, prevTokens]);

    return (
        <Link to="/store" className={cn("flex items-center gap-2 bg-muted/50 hover:bg-muted/80 transition-colors text-foreground px-4 py-2 rounded-full border border-border/50 relative overflow-visible cursor-pointer", className)}>
            <div className="bg-amber-500/10 p-1 rounded-full">
                <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <span className="font-bold text-sm tracking-tight">{user.tokens.toLocaleString()}</span>

            <AnimatePresence>
                {diff !== 0 && (
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: -20 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "absolute right-0 -top-2 text-xs font-bold pointer-events-none",
                            diff > 0 ? "text-green-500" : "text-destructive"
                        )}
                    >
                        {diff > 0 ? '+' : ''}{diff}
                    </motion.span>
                )}
            </AnimatePresence>
        </Link>
    );
};
