import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface StatBarProps {
    label: string;
    leftValue: number | string;
    rightValue: number | string;
    leftColor?: string; // e.g., 'bg-blue-500'
    rightColor?: string; // e.g., 'bg-red-500'
    maxValue?: number; // normalization base
    isPercentage?: boolean;
    className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({
    label,
    leftValue,
    rightValue,
    leftColor = 'bg-blue-500',
    rightColor = 'bg-red-500',
    maxValue = 100,
    isPercentage = false,
    className
}) => {
    // Parse values to numbers for width calculation
    const numLeft = typeof leftValue === 'string' ? parseFloat(leftValue) : leftValue;
    const numRight = typeof rightValue === 'string' ? parseFloat(rightValue) : rightValue;

    // Calculate widths (relative to max value if known, or relative to sum of both)
    // If maxValue is provided, use that. Otherwise use left + right (which might fill 100%)
    // The design shows bars usually not filling 100% unless it's possession

    // Strategy: Use maxValue if typical stat (e.g. goals), use 100 if percentage
    const safeMax = maxValue || (numLeft + numRight) * 1.2; // Add some padding if creating scale

    const leftWidth = Math.min((numLeft / safeMax) * 100, 100);
    const rightWidth = Math.min((numRight / safeMax) * 100, 100);

    return (
        <div className={cn("w-full py-2", className)}>
            <div className="flex justify-between text-xs font-bold mb-1 uppercase tracking-wider text-muted-foreground">
                <span className="text-white">{leftValue}{isPercentage && '%'}</span>
                <span>{label}</span>
                <span className="text-white">{rightValue}{isPercentage && '%'}</span>
            </div>

            <div className="flex items-center gap-1 h-2 w-full">
                {/* Left Bar (Right aligned) */}
                <div className="flex-1 flex justify-end bg-muted/20 rounded-l-full overflow-hidden h-full">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${leftWidth}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-l-full shadow-[0_0_10px_rgba(var(--primary),0.5)]", leftColor)}
                    />
                </div>

                {/* Center Divider */}
                <div className="w-0.5 h-full bg-white/10" />

                {/* Right Bar (Left aligned) */}
                <div className="flex-1 flex justify-start bg-muted/20 rounded-r-full overflow-hidden h-full">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rightWidth}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full rounded-r-full", rightColor)}
                    />
                </div>
            </div>
        </div>
    );
};
