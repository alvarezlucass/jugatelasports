import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export const NotificationSimulator: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lastNotification, setLastNotification] = useState<string | null>(null);

    const triggerNotification = (msg: string) => {
        setLastNotification(`🔔 ${msg}`);
        setTimeout(() => setLastNotification(null), 3000);
    };

    const NOTIFICATIONS = [
        "⚽ Faltan 30 min para cerrar predicciones: River vs Boca",
        "🔥 ¡Tu amigo Juan te superó en el ranking!",
        "💰 Quedan 2 horas para cobrar tus 10 tokens diarios",
        "⭐ Hoy hay CLÁSICO: ¿Quién será titular?",
        "🎁 ¡Juntaste suficientes tokens! Canjeá tu premio",
        "🏆 Ganaste el duelo contra María (+50 tokens)"
    ];

    return (
        <>
            <div className="fixed top-20 right-4 z-[60]">
                {isOpen ? (
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-4 w-64 space-y-2">
                        <div className="flex justify-between items-center border-b border-gray-800 pb-2 mb-2">
                            <span className="text-xs font-bold text-gray-400">Simular WhatsApp</span>
                            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-500" /></button>
                        </div>
                        {NOTIFICATIONS.map((note, i) => (
                            <button
                                key={i}
                                onClick={() => triggerNotification(note)}
                                className="w-full text-left text-[10px] p-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 transition-colors"
                            >
                                {note}
                            </button>
                        ))}
                    </div>
                ) : (
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                        title="Simular Notificaciones"
                    >
                        <MessageCircle className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>

            {/* Simulated Toast */}
            <AnimatePresence>
                {lastNotification && (
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="fixed top-4 right-4 bg-white text-gray-900 px-4 py-3 rounded-xl shadow-2xl z-[70] flex items-center gap-3 border-l-4 border-green-500 max-w-sm"
                    >
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500">WhatsApp • Ahora</p>
                            <p className="text-sm font-medium leading-tight">{lastNotification.replace('🔔 ', '')}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
