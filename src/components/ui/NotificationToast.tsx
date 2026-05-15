import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, Zap, Sword, CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'SUCCESS' | 'INFO' | 'WARNING' | 'ERROR' | 'PVP' | 'RANKING' | 'POINTS';

interface NotificationToastProps {
    id: string;
    type: ToastType;
    title: string;
    message: string;
    onClose: (id: string) => void;
    duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ 
    id, type, title, message, onClose, duration = 5000 
}) => {
    useEffect(() => {
        const timer = setTimeout(() => onClose(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="text-emerald-500" size={20} />;
            case 'ERROR': return <XCircle className="text-red-500" size={20} />;
            case 'PVP': return <Sword className="text-indigo-400" size={20} />;
            case 'RANKING': return <Trophy className="text-amber-500" size={20} />;
            case 'POINTS': return <Zap className="text-blue-500" size={20} />;
            default: return <Info className="text-blue-400" size={20} />;
        }
    };

    const getColors = () => {
        switch (type) {
            case 'SUCCESS': return 'border-emerald-500/20 bg-emerald-500/10 shadow-emerald-500/10';
            case 'ERROR': return 'border-red-500/20 bg-red-500/10 shadow-red-500/10';
            case 'PVP': return 'border-indigo-500/20 bg-indigo-500/10 shadow-indigo-500/10';
            case 'RANKING': return 'border-amber-500/20 bg-amber-500/10 shadow-amber-500/10';
            case 'POINTS': return 'border-blue-500/20 bg-blue-500/10 shadow-blue-500/10';
            default: return 'border-white/10 bg-white/5 shadow-black/20';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-[1.5rem] border backdrop-blur-xl transition-all duration-300 ${getColors()}`}
        >
            <div className="flex w-full p-4 gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/5">
                    {getIcon()}
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-black text-white uppercase tracking-tight">{title}</p>
                    <p className="text-xs font-medium text-zinc-400 leading-tight">{message}</p>
                </div>
                <button
                    onClick={() => onClose(id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg hover:bg-white/5 text-zinc-600 hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
            {/* Progress bar timer */}
            <motion.div 
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 origin-left"
            />
        </motion.div>
    );
};

// Container for managing multiple toasts
export const ToastContainer: React.FC<{
    toasts: { id: string; type: ToastType; title: string; message: string }[];
    onClose: (id: string) => void;
}> = ({ toasts, onClose }) => {
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <NotificationToast 
                        key={toast.id}
                        {...toast}
                        onClose={onClose}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};
