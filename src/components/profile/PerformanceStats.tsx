import React, { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { WalletTransaction, Prediction } from '../../types';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';

interface PerformanceStatsProps {
  transactions: WalletTransaction[];
  predictions: Prediction[];
}

export const PerformanceStats: React.FC<PerformanceStatsProps> = ({ transactions, predictions }) => {
  // 1. Procesar datos para el gráfico de tendencia (Puntos ganados por tiempo)
  const chartData = useMemo(() => {
    const wins = transactions
      .filter(t => t.type === 'BET_WIN' || t.amount > 0 && t.description.includes('Puntos'))
      .map(t => ({
        date: new Date(t.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
        points: t.amount,
        timestamp: new Date(t.date).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Acumular puntos
    let total = 0;
    return wins.map(w => {
      total += w.points;
      return { ...w, total };
    }).slice(-10); // Mostrar últimos 10 hitos
  }, [transactions]);

  // 2. Procesar precisión (Wins vs Losses)
  const accuracyData = useMemo(() => {
    const total = predictions.length;
    const wins = predictions.filter(p => p.status === 'WON').length;
    const losses = predictions.filter(p => p.status === 'LOST').length;
    
    return [
      { name: 'Aciertos', value: wins, color: '#10b981' },
      { name: 'Fallos', value: losses, color: '#ef4444' },
      { name: 'Pendientes', value: total - wins - losses, color: '#6366f1' }
    ];
  }, [predictions]);

  const COLORS = ['#10b981', '#ef4444', '#6366f1'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Mini Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div className="text-2xl font-black text-white">{predictions.filter(p => p.status === 'WON').length}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Victorias</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
            <Target className="w-5 h-5 text-blue-500" />
            <div className="text-2xl font-black text-white">
                {predictions.length > 0 ? Math.round((predictions.filter(p => p.status === 'WON').length / predictions.length) * 100) : 0}%
            </div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Precisión</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
            <Zap className="w-5 h-5 text-green-500" />
            <div className="text-2xl font-black text-white">{transactions.filter(t => t.type === 'BET_WIN').reduce((acc, t) => acc + t.amount, 0)}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Pts Totales</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <div className="text-2xl font-black text-white">X1.2</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Multiplicador</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Tendencia de Puntos</h4>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[9px] font-black rounded-lg border border-green-500/20">Últimas 10 Ganancias</span>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#ffffff20" 
                            fontSize={10} 
                            fontWeight="bold"
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#121820', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '12px' }}
                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Accuracy Chart */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] space-y-6">
            <h4 className="text-sm font-black text-white uppercase tracking-widest text-center">Distribución de Aciertos</h4>
            <div className="h-64 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={accuracyData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                        >
                            {accuracyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#121820', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-white">
                        {predictions.length > 0 ? Math.round((predictions.filter(p => p.status === 'WON').length / predictions.length) * 100) : 0}%
                    </span>
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Efectividad</span>
                </div>
            </div>
            
            <div className="flex justify-center gap-6">
                {accuracyData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{item.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};
