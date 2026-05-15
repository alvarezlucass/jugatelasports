import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Award, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StaffMember {
    name: string;
    role: string;
    photo?: string;
    nationality?: string;
}

interface StaffPanelProps {
    homeStaff: StaffMember[];
    awayStaff: StaffMember[];
    homeName: string;
    awayName: string;
}

export const StaffPanel: React.FC<StaffPanelProps> = ({ homeStaff, awayStaff, homeName, awayName }) => {
    const renderStaffList = (staff: StaffMember[], teamName: string, side: 'left' | 'right') => {
        const coach = staff.find(s => s.role.toLowerCase().includes('coach') || s.role.toLowerCase().includes('técnico'));
        const others = staff.filter(s => s !== coach);

        return (
            <div className={cn("space-y-6", side === 'right' && "text-right")}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">
                    Staff {teamName}
                </h4>

                {/* Main Coach Card */}
                {coach && (
                    <motion.div 
                        initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 transition-colors group"
                    >
                        <div className={cn("flex items-center gap-4", side === 'right' && "flex-row-reverse")}>
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-white/5">
                                <img 
                                    src={coach.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${coach.name}`} 
                                    alt={coach.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{coach.role}</p>
                                <h5 className="text-sm font-black text-white truncate">{coach.name}</h5>
                                <div className={cn("flex items-center gap-2 mt-1", side === 'right' && "flex-row-reverse")}>
                                    <span className="text-lg">🇦🇷</span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Nacionalidad</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Other Staff Members */}
                <div className="space-y-3">
                    {others.map((member, idx) => (
                        <div key={idx} className={cn("flex items-center gap-3 px-2 py-1 border-b border-white/5", side === 'right' && "flex-row-reverse")}>
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                                <Users size={14} className="text-zinc-500" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-bold text-white truncate">{member.name}</p>
                                <p className="text-[8px] text-zinc-500 uppercase tracking-widest">{member.role}</p>
                            </div>
                        </div>
                    ))}
                    {others.length === 0 && (
                        <p className="text-[9px] text-zinc-600 italic">No hay staff adicional registrado</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/[0.02] border border-white/5 rounded-3xl p-8">
            {renderStaffList(homeStaff, homeName, 'left')}
            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <BoardIcon size={120} />
            </div>
            {renderStaffList(awayStaff, awayName, 'right')}
        </div>
    );
};

const BoardIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
        <line x1="12" y1="3" x2="12" y2="21" />
        <path d="M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M5 8c0 4.5 0 4.5 0 9" />
        <path d="M19 8c0 4.5 0 4.5 0 9" />
    </svg>
);
