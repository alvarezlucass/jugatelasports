import React from 'react';
import { TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    subValueType?: 'success' | 'warning' | 'neutral';
    icon?: LucideIcon;
    iconColor?: string;
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subValue,
    subValueType = 'neutral',
    icon: Icon,
    iconColor = 'text-primary',
    className
}) => {
    return (
        <div className={cn("p-6 rounded-3xl bg-card border border-border/50 shadow-sm relative overflow-hidden group hover:border-border transition-colors", className)}>
            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
                    {Icon && <Icon className={cn("w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity", iconColor)} />}
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-foreground">{value}</span>
                    {subValue && (
                        <span className={cn(
                            "text-xs font-bold px-1.5 py-0.5 rounded-md",
                            subValueType === 'success' && "text-green-500 bg-green-500/10",
                            subValueType === 'warning' && "text-amber-500 bg-amber-500/10",
                            subValueType === 'neutral' && "text-muted-foreground"
                        )}>
                            {subValue}
                        </span>
                    )}
                </div>

                {/* Background Decoration */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-primary/10 transition-colors" />
            </div>
        </div>
    );
};
