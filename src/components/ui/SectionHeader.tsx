import React from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
    title: string;
    badge?: string | number;
    icon?: React.ElementType;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, badge, icon: Icon, className }) => {
    return (
        <div className={cn("flex items-center gap-3 mb-6", className)}>
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {badge !== undefined && (
                <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </div>
    );
};
