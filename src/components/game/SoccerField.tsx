import React from 'react';
import { cn } from '../../lib/utils';

export const SoccerField: React.FC<{ children?: React.ReactNode, className?: string }> = ({ children, className }) => {
    return (
        <div className={cn("relative w-full aspect-[2/3] bg-green-600 rounded-xl overflow-hidden border-4 border-green-800 shadow-inner", className)}>
            {/* Grass Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.1)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.1)_2px,transparent_2px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)] pointer-events-none" />

            {/* Field Lines */}
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-white/50 rounded-full" />
            {/* Center Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50 -translate-y-1/2" />
            {/* Penalty Areas */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 border-b-2 border-x-2 border-white/50" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-24 border-t-2 border-x-2 border-white/50" />

            {children}
        </div>
    );
};
