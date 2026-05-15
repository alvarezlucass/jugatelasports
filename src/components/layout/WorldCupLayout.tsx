import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

export const WorldCupLayout: React.FC = () => {
    const navigate = useNavigate();
    // Determine if we should show the back button instead of the sub-nav
    // e.g., when viewing a specific match prediction or team squad, we might want to just show "Back to World Cup"
    // For now, let's keep it simple and show the Sub-Nav globally for /worldcup routes,
    // but allow the layout to handle a global "Back to Sports Home" button.

    const tabs = [
        { to: '/worldcup', label: 'Resumen', icon: Trophy, end: true },
        { to: '/worldcup/venues', label: 'Sedes', icon: MapPin, end: false },
    ];

    return (
        <div className="min-h-screen bg-[#0A0D12] pb-24 md:pb-8">
            {/* World Cup Contextual Navigation */}
            <div className="sticky top-14 md:top-16 z-30 w-full bg-[#131822]/95 backdrop-blur-md border-b border-white/5 shadow-xl">
                <div className="container mx-auto px-4 h-12 flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center gap-1 text-zinc-400 hover:text-white transition-colors mr-2 pr-4 border-r border-white/10 shrink-0"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-[10px] uppercase font-bold tracking-widest hidden sm:inline">Deportes</span>
                    </button>
                    
                    {tabs.map((tab) => (
                        <NavLink
                            key={tab.to}
                            to={tab.to}
                            end={tab.end}
                            className={({ isActive }) => cn(
                                "flex items-center gap-2 px-4 h-full text-xs font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap",
                                isActive ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <tab.icon size={14} className={cn(isActive && "fill-blue-400/20")} />
                                    <span>{tab.label}</span>
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Nested Content */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};
