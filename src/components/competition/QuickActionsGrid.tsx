import React from 'react';
import { Bot, Trophy, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export const QuickActionsGrid: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <ActionCard
                title="Desafío IA"
                description="Desafía a nuestro predictor de IA con parámetros personalizados y gana bonos multiplicadores JGT."
                icon={<Bot className="w-6 h-6 text-blue-400" />}
                colorClass="border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5"
                iconBg="bg-blue-500/10"
                onClick={() => console.log('AI Challenge')}
            />
            <ActionCard
                title="Ránking Global"
                description="Mira dónde te sitúas entre el top 1% de expertos mundiales. Recompensas semanales para el Top 50."
                icon={<Trophy className="w-6 h-6 text-cyan-400" />}
                colorClass="border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/5"
                iconBg="bg-cyan-500/10"
                onClick={() => console.log('Ranking')}
            />
            <ActionCard
                title="Historial de Apuestas"
                description="Revisa tus predicciones pasadas, estadísticas de aciertos y crecimiento total de tu bankroll."
                icon={<History className="w-6 h-6 text-emerald-400" />}
                colorClass="border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5"
                iconBg="bg-emerald-500/10"
                onClick={() => navigate('/history')}
            />
        </div>
    );
};

interface ActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    iconBg: string;
    onClick?: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, colorClass, iconBg, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative p-6 rounded-3xl bg-card border transition-all duration-300 cursor-pointer overflow-hidden",
                colorClass
            )}
        >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", iconBg)}>
                {icon}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {description}
            </p>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-white transition-colors">
                <span>Explorar</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
    );
};
