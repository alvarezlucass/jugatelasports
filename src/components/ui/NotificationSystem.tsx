import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sword, X, ChevronRight, Info, Share2, Trophy } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import type { AppNotification } from '../../types';

export const PvpNotificationToast: React.FC = () => {
    const { notifications, markNotificationAsRead } = useUser();
    const navigate = useNavigate();

    // Mostrar el brindis más reciente que no ha sido leído
    const [latestToast, setLatestToast] = useState<AppNotification | null>(null);

    useEffect(() => {
        const unread = notifications.filter(n => !n.isRead && n.type === 'PVP_INVITE');
        if (unread.length > 0) {
            setLatestToast(unread[0]);
        } else {
            setLatestToast(null);
        }
    }, [notifications]);

    const handleDismiss = (id: string) => {
        markNotificationAsRead(id);
        setLatestToast(null);
    };

    const handleView = (notification: AppNotification) => {
        markNotificationAsRead(notification.id);
        navigate(notification.path);
    };

    return (
        <AnimatePresence>
            {latestToast && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
                >
                    <div className="bg-gradient-to-r from-blue-900/95 to-indigo-900/95 border border-blue-500/30 shadow-2xl shadow-blue-900/50 rounded-2xl p-4 backdrop-blur-md flex items-center gap-4 cursor-pointer" onClick={() => handleView(latestToast)}>
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/50 flex items-center justify-center bg-blue-950">
                                <Sword size={20} className="text-blue-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-blue-900 flex items-center justify-center">
                                <Bell size={10} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-black text-sm uppercase tracking-tight truncate">
                                {latestToast.title}
                            </h4>
                            <p className="text-blue-200/70 text-[10px] uppercase tracking-widest font-bold line-clamp-1 truncate mt-0.5">
                                {latestToast.message}
                            </p>
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDismiss(latestToast.id); }}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
                        >
                            <X size={16} className="text-blue-200" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const NotificationBell: React.FC = () => {
    const { user, notifications, markNotificationAsRead } = useUser();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const pendingCount = notifications.filter(n => !n.isRead).length;
    const hasUnread = pendingCount > 0;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification: AppNotification) => {
        markNotificationAsRead(notification.id);
        setIsOpen(false);
        navigate(notification.path);
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 transition-colors rounded-full",
                    isOpen ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
            >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 flex h-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500 border border-[#0F131A]"></span>
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-[#0F131A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
                    >
                        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex flex-col gap-2">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest flex items-center justify-between">
                                Notificaciones
                                {hasUnread && (
                                    <span className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full">{pendingCount} Nuevas</span>
                                )}
                            </h3>
                            <button 
                                onClick={async () => {
                                    const { subscribeToPushNotifications } = await import('../../utils/pushNotifications');
                                    if (user) await subscribeToPushNotifications(user.id);
                                    alert('¡Suscripción a notificaciones configurada!');
                                }}
                                className="w-full text-center px-2 py-1.5 bg-blue-500/10 text-blue-400 rounded text-[9px] font-bold uppercase tracking-wider hover:bg-blue-500/20 transition-colors"
                            >
                                Activar Alertas en el Celular
                            </button>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-zinc-500">
                                    <Bell size={24} className="mx-auto mb-3 opacity-30" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Cero notificaciones</p>
                                    <p className="text-[9px] text-zinc-600 mt-1">Acá aparecerá la actividad de tus retos.</p>
                                    <button 
                                        onClick={async () => {
                                            const { subscribeToPushNotifications } = await import('../../utils/pushNotifications');
                                            if (user) await subscribeToPushNotifications(user.id);
                                            alert('¡Suscripción a notificaciones configurada!');
                                        }}
                                        className="mt-4 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/30 transition-colors"
                                    >
                                        Activar Notificaciones Push
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {notifications.map(notif => {
                                        let Icon = Info;
                                        let iconColor = 'bg-zinc-500';

                                        switch(notif.type) {
                                            case 'PVP_INVITE':
                                                Icon = Sword;
                                                iconColor = 'bg-amber-500';
                                                break;
                                            case 'CHALLENGE_ACCEPTED':
                                                Icon = Sword;
                                                iconColor = 'bg-emerald-500';
                                                break;
                                            case 'CHALLENGE_FINISHED':
                                                Icon = Trophy;
                                                iconColor = 'bg-blue-500';
                                                break;
                                            case 'SOCIAL':
                                                Icon = Share2;
                                                iconColor = 'bg-purple-500';
                                                break;
                                        }

                                        return (
                                            <div 
                                                key={notif.id}
                                                onClick={() => handleNotificationClick(notif)}
                                                className={cn(
                                                    "p-4 cursor-pointer transition-colors flex gap-3 group relative",
                                                    notif.isRead ? "opacity-40 grayscale-[0.5]" : "bg-white/[0.02] hover:bg-white/[0.05]"
                                                )}
                                            >
                                                {!notif.isRead && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                                                )}
                                                
                                                <div className="relative shrink-0">
                                                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconColor)}>
                                                        <Icon size={18} className="text-white" />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white leading-tight">
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <div className="text-[8px] text-zinc-600 mt-1 uppercase font-bold tracking-tighter">
                                                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                                
                                                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight size={16} className="text-zinc-500" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-2 border-t border-white/5 bg-black/20">
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate('/profile', { state: { pvpTab: 'PVP' } });
                                }}
                                className="w-full py-2 flex items-center justify-center gap-2 text-center text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-colors"
                            >
                                Gestionar Desafíos <ChevronRight size={12} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

