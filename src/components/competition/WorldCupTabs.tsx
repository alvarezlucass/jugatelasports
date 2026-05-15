import React from 'react';
import { Calendar, Users, Trophy, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

export type WorldCupView = 'matches' | 'bracket' | 'prediction' | 'social' | 'venues';

interface WorldCupTabsProps {
    activeView: WorldCupView;
    onViewChange: (view: WorldCupView) => void;
}

export const WorldCupTabs: React.FC<WorldCupTabsProps> = ({ activeView, onViewChange }) => {
    const tabs = [
        { id: 'matches', label: 'Todos', icon: Calendar },
        { id: 'bracket', label: 'Fase Final', icon: Trophy },
        { id: 'venues', label: 'Sedes', icon: MapPin },
        { id: 'social', label: 'Estadísticas', icon: Users },
    ] as const;

    return (
        <div className="flex items-center justify-center p-1.5 bg-[#0F131A] border border-white/5 rounded-full w-fit mx-auto shadow-2xl">
            {tabs.map((tab) => {
                const isActive = activeView === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onViewChange(tab.id)}
                        className={cn(
                            "px-6 md:px-8 py-2.5 rounded-full text-xs md:text-[13px] font-black transition-all duration-300 uppercase tracking-tight",
                            isActive
                                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                                : "text-zinc-400 hover:text-white"
                        )}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
