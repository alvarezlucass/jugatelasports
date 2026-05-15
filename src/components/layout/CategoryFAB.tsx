import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutGrid, 
    Trophy, 
    Globe, 
    Car, 
    Zap, 
    Activity, 
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface CategoryOption {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
    color: string;
    glow: string;
}

const CATEGORIES: CategoryOption[] = [
    { 
        id: 'worldcup', 
        label: 'Copa Mundo 2026', 
        icon: Trophy, 
        path: '/predictions', 
        color: 'bg-blue-600',
        glow: 'shadow-blue-500/20'
    },
    { 
        id: 'ucl', 
        label: 'Champions League', 
        icon: Zap, 
        path: '/leagues', 
        color: 'bg-indigo-600',
        glow: 'shadow-indigo-500/20'
    },
    { 
        id: 'libertadores', 
        label: 'Libertadores', 
        icon: Globe, 
        path: '/leagues', 
        color: 'bg-amber-600',
        glow: 'shadow-amber-500/20'
    },
    { 
        id: 'f1', 
        label: 'Fórmula 1', 
        icon: Car, 
        path: '/f1', 
        color: 'bg-red-600',
        glow: 'shadow-red-500/20'
    },
    { 
        id: 'nba', 
        label: 'Basketball', 
        icon: Activity, 
        path: '/basketball', 
        color: 'bg-orange-600',
        glow: 'shadow-orange-500/20'
    }
];

export const CategoryFAB: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed top-40 right-4 md:top-1/2 md:-translate-y-1/2 md:right-8 z-[60] flex flex-col items-end gap-3 group"
        >
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col items-end gap-4 mb-4">
                        {CATEGORIES.map((cat, idx) => (
                            <motion.button
                                key={cat.id}
                                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                animate={{ 
                                    opacity: 1, 
                                    x: 0, 
                                    scale: 1,
                                    transition: { delay: idx * 0.05, type: 'spring', stiffness: 300, damping: 20 }
                                }}
                                exit={{ 
                                    opacity: 0, 
                                    x: 20, 
                                    scale: 0.8,
                                    transition: { delay: (CATEGORIES.length - 1 - idx) * 0.05 }
                                }}
                                onClick={() => handleNavigate(cat.path)}
                                className="group flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-[#131822]/90 backdrop-blur-xl border border-white/5 hover:border-white/10 transition-all hover:bg-white/5 shadow-2xl active:scale-95"
                            >
                                <span className="text-[10px] uppercase font-black tracking-[0.1em] text-zinc-400 group-hover:text-white transition-colors">
                                    {cat.label}
                                </span>
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg",
                                    cat.color,
                                    cat.glow
                                )}>
                                    <cat.icon size={18} strokeWidth={2.5} />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            {/* Backdrop Blur Overlay when open - Subtle */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[-1]"
                    />
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button
                onClick={toggleMenu}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    "w-14 h-14 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-2xl relative",
                    isOpen 
                        ? "bg-zinc-800 text-white rotate-90" 
                        : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20"
                )}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-inherit pointer-events-none" />
                {isOpen ? <X size={24} strokeWidth={3} /> : <LayoutGrid size={24} strokeWidth={2.5} />}
                
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 border-2 border-[#0A0D12]"></span>
                    </span>
                )}
            </motion.button>

            {/* Quick Helper Label - Appear on hover only, to the left */}
            {!isOpen && (
                <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="absolute right-16 top-[78%] -translate-y-1/2 pointer-events-none"
                >
                    <div className="bg-[#131822]/90 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10 shadow-2xl whitespace-nowrap">
                        <span className="text-[9px] font-black uppercase text-blue-400 tracking-[0.15em]">Acceso Rápido</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
