import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Newspaper, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsItem {
    id: string;
    tag: string;
    headline: string;
    source_url: string;
    created_at: string;
}

const getDomain = (url: string) => {
    try {
        return new URL(url).hostname.replace('www.', '');
    } catch {
        return 'Enlace';
    }
};

export const MatchNews: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    const loadNews = async () => {
        const { data, error } = await supabase
            .from('news')
            .select('*')
            .eq('status', 'APPROVED')
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setNews(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadNews();
        // Opcional: suscribirse a cambios
        const channel = supabase.channel('news_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, () => {
                loadNews();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="flex flex-col h-[500px] bg-[#0F131A]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <Newspaper size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Noticias en Vivo</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Última hora del deporte</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Activo</span>
                </div>
            </div>

            {/* News Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-track]:bg-transparent">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Buscando noticias...</p>
                    </div>
                ) : news.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Newspaper size={32} className="text-zinc-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">No hay noticias<br/>relevantes por ahora.</p>
                    </div>
                ) : (
                    news.map((item) => (
                        <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 hover:bg-white/10 transition-colors">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-black tracking-widest uppercase">
                                    {item.tag}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">
                                    {formatDistanceToNow(new Date(item.created_at), { locale: es, addSuffix: true })}
                                </span>
                            </div>
                            <h4 className="text-xs font-bold text-white leading-relaxed">
                                {item.headline}
                            </h4>
                            {item.source_url && (
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] font-bold text-zinc-400">
                                        Fuente: {getDomain(item.source_url)}
                                    </span>
                                    <a 
                                        href={item.source_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase transition-colors"
                                    >
                                        Leer <ExternalLink size={10} />
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
