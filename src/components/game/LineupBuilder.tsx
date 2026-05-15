import React, { useState } from 'react';
import type { Team } from '../../types';
import { SoccerField } from './SoccerField';
import { MOCK_PLAYERS } from '../../data/mockData';
import { UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
// Removed unused useUser

interface LineupBuilderProps {
    team: Team;
    onSave: (lineup: string[]) => void;
}

const POSITIONS_ON_FIELD = [
    { id: 'GK', top: '85%', left: '50%' },
    { id: 'LB', top: '70%', left: '15%' },
    { id: 'CB1', top: '70%', left: '38%' },
    { id: 'CB2', top: '70%', left: '62%' },
    { id: 'RB', top: '70%', left: '85%' },
    { id: 'LM', top: '45%', left: '20%' },
    { id: 'CM1', top: '45%', left: '50%' },
    { id: 'RM', top: '45%', left: '80%' },
    { id: 'LW', top: '20%', left: '20%' },
    { id: 'ST', top: '15%', left: '50%' },
    { id: 'RW', top: '20%', left: '80%' },
];

export const LineupBuilder: React.FC<LineupBuilderProps> = ({ team, onSave }) => {
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);

    const teamPlayers = MOCK_PLAYERS.filter(p => p.teamId === team.id);

    const handleSlotClick = (index: number) => {
        setActiveSlot(index);
    };

    const handlePlayerSelect = (playerId: string) => {
        if (activeSlot !== null) {
            const newLineup = [...selectedPlayers];
            // Remove if already selected elsewhere
            const existingIdx = newLineup.indexOf(playerId);
            if (existingIdx !== -1) newLineup[existingIdx] = '';

            while (newLineup.length <= activeSlot) newLineup.push('');
            newLineup[activeSlot] = playerId;

            setSelectedPlayers(newLineup);
            setActiveSlot(null);
        }
    };

    const removePlayer = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newLineup = [...selectedPlayers];
        newLineup[index] = '';
        setSelectedPlayers(newLineup);
    };

    return (
        <div className="flex flex-col h-full bg-gray-950">
            <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-bold text-white">Armá tu 11 de {team.name}</h2>
                <span className="text-xs text-gray-400">{selectedPlayers.filter(Boolean).length}/11 jugadores</span>
            </div>

            <div className="flex-1 relative overflow-hidden flex flex-col items-center p-4">
                <SoccerField className="max-w-sm mx-auto shadow-2xl shadow-green-900/50">
                    {POSITIONS_ON_FIELD.map((pos, index) => {
                        const playerId = selectedPlayers[index];
                        const player = playerId ? teamPlayers.find(p => p.id === playerId) : null;

                        return (
                            <motion.button
                                key={index}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={cn(
                                    "absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-10",
                                    player ? "bg-white border-white" : "bg-black/30 border-white/30 backdrop-blur-sm",
                                    activeSlot === index && "ring-4 ring-primary ring-offset-2 ring-offset-green-600"
                                )}
                                style={{ top: pos.top, left: pos.left }}
                                onClick={() => handleSlotClick(index)}
                            >
                                {player ? (
                                    <>
                                        <span className="font-bold text-gray-900 text-[10px] leading-tight text-center px-1 overflow-hidden">{player.name}</span>
                                        <button
                                            onClick={(e) => removePlayer(index, e)}
                                            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 text-white shadow-sm"
                                        >
                                            <X className="w-2 h-2" />
                                        </button>
                                    </>
                                ) : (
                                    <UserPlus className="w-5 h-5 text-white/50" />
                                )}

                                {!player && <div className="absolute -bottom-4 text-[8px] font-bold text-white/70 bg-black/50 px-1 rounded">{pos.id}</div>}
                            </motion.button>
                        );
                    })}
                </SoccerField>

                <AnimatePresence>
                    {activeSlot !== null && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="absolute inset-x-0 bottom-0 bg-gray-900 border-t border-gray-800 rounded-t-2xl z-20 h-1/2 flex flex-col shadow-2xl"
                        >
                            <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                                <span className="font-bold text-sm text-gray-300">Seleccionar Jugador</span>
                                <button onClick={() => setActiveSlot(null)} className="p-1"><X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="overflow-y-auto flex-1 p-2 space-y-1">
                                {teamPlayers.map(player => {
                                    const isSelected = selectedPlayers.includes(player.id);
                                    return (
                                        <button
                                            key={player.id}
                                            disabled={isSelected}
                                            onClick={() => handlePlayerSelect(player.id)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 rounded-xl border transition-colors",
                                                isSelected
                                                    ? "bg-gray-800/50 border-gray-800 opacity-50 cursor-not-allowed"
                                                    : "bg-gray-800 border-gray-700 hover:border-primary hover:bg-gray-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xs text-gray-400">
                                                    {player.number}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-white text-sm">{player.name}</div>
                                                    <div className="text-[10px] text-gray-400 font-mono">{player.position}</div>
                                                </div>
                                            </div>
                                            {isSelected && <span className="text-xs text-green-500 font-bold">Seleccionado</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <button
                    disabled={selectedPlayers.filter(Boolean).length !== 11}
                    onClick={() => onSave(selectedPlayers)}
                    className="w-full bg-primary disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                    Confirmar Titulares (+50 Pts)
                </button>
            </div>
        </div>
    );
};
