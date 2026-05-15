import React from 'react';
import { Calendar, MapPin, Clock, ChevronLeft, Info } from 'lucide-react';
import { type GroupMatch } from '../../data/worldCupPersistence';
import { useNavigate } from 'react-router-dom';
import { GroupCard } from './GroupCard';
import { OfficialMatchList } from './OfficialMatchList';

interface GroupFixtureViewProps {
    groupLetter: string;
    matches: GroupMatch[];
    competitionName?: string;
    standings?: any[];
    onTeamClick?: (teamName: string) => void;
}

export const GroupFixtureView: React.FC<GroupFixtureViewProps> = ({ groupLetter, matches, competitionName = "Copa Mundial 2026", standings, onTeamClick }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen pb-24 animate-in fade-in duration-700 bg-[#0A0D12]">
            {/* Header */}
            <div className="container mx-auto px-4 pt-12 pb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest mb-6 transition-colors"
                >
                    <ChevronLeft size={16} /> Volver al Mundial
                </button>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-[0.2em] text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {competitionName}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                        Fixture <span className="text-blue-600">Grupo {groupLetter}</span>
                    </h1>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 text-zinc-500">
                        <p className="text-base md:text-lg font-bold">
                            Completa tus marcadores para tus Jugadas
                        </p>
                        <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 px-3 py-1 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest">
                            <Info size={14} /> Gana 3 pts por acierto exacto
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-6 space-y-12">
                {standings && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                        <GroupCard
                            groupLetter={groupLetter}
                            teams={standings}
                            onTeamClick={onTeamClick}
                        />
                    </div>
                )}

                <div className="bg-[#0F131A] border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <OfficialMatchList 
                        matches={matches} 
                        onMatchClick={(id) => navigate(`/predictions/match/${id}`)}
                    />
                </div>
            </div>
        </div>
    );
};
