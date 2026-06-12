import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
    id: string;
    tag: string;
    headline: string;
    body: string;
    source_url: string;
    tweet_1: string;
    tweet_2: string;
    tweet_3: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const AdminNewsDashboard: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [pendingNews, setPendingNews] = useState<NewsItem[]>([]);
    const [approvedNews, setApprovedNews] = useState<NewsItem[]>([]);
    const [activeTab, setActiveTab] = useState<'curator' | 'prompts' | 'firebase'>('curator');
    const [activeItem, setActiveItem] = useState<NewsItem | null>(null);

    // Edit states
    const [editHeadline, setEditHeadline] = useState('');
    const [editTag, setEditTag] = useState('');
    const [editSourceUrl, setEditSourceUrl] = useState('');
    const [editTuit1, setEditTuit1] = useState('');
    const [editTuit2, setEditTuit2] = useState('');
    const [editTuit3, setEditTuit3] = useState('');

    useEffect(() => {
        // Enforce Admin only
        if (user && user.role !== 'ADMIN') {
            navigate('/');
        }
        if (user && user.role === 'ADMIN') {
            loadNews();
        }
    }, [user, navigate]);

    const loadNews = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.toISOString();

        const { data: pending } = await supabase
            .from('news')
            .select('*')
            .eq('status', 'PENDING')
            .gte('created_at', startOfDay)
            .order('created_at', { ascending: false });
        
        if (pending) setPendingNews(pending as NewsItem[]);

        const { data: approved } = await supabase
            .from('news')
            .select('*')
            .eq('status', 'APPROVED')
            .gte('created_at', startOfDay)
            .order('created_at', { ascending: false });
        
        if (approved) setApprovedNews(approved as NewsItem[]);
    };

    const deletePending = async (id: string) => {
        await supabase.from('news').update({ status: 'REJECTED' }).eq('id', id);
        loadNews();
        if (activeItem?.id === id) setActiveItem(null);
    };

    const deleteApproved = async (id: string) => {
        await supabase.from('news').update({ status: 'REJECTED' }).eq('id', id);
        loadNews();
    };

    const openModeration = (item: NewsItem) => {
        setActiveItem(item);
        setEditHeadline(item.headline || '');
        setEditTag(item.tag || 'MUNDIALISTA');
        setEditSourceUrl(item.source_url || '');
        setEditTuit1(item.tweet_1 || '');
        setEditTuit2(item.tweet_2 || '');
        setEditTuit3(item.tweet_3 || '');
    };

    const approveItem = async () => {
        if (!activeItem) return;
        await supabase.from('news').update({
            headline: editHeadline,
            tag: editTag,
            source_url: editSourceUrl,
            tweet_1: editTuit1,
            tweet_2: editTuit2,
            tweet_3: editTuit3,
            status: 'APPROVED'
        }).eq('id', activeItem.id);
        setActiveItem(null);
        loadNews();
    };

    const copyTuit = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copiado al portapapeles!');
    };

    if (!user || user.role !== 'ADMIN') return <div className="text-white p-10 text-center">Acceso Denegado</div>;

    return (
        <div className="text-gray-100 min-h-screen flex flex-col bg-[#020c1b] font-['Montserrat']">
            {/* Header */}
            <header className="bg-[#0a1128] border-b border-[#1e293b] py-4 px-6 sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black tracking-tight text-white font-['Orbitron']">JUGATELA <span className="text-[#00d2ff]">SPORTS</span></h1>
                        <p className="text-xs text-gray-400 mt-1">Consola de Moderación</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left sidebar */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-[#0a1128]/80 rounded-2xl p-4 border border-[#1e293b] space-y-1">
                        <span className="text-[10px] font-bold text-[#00d2ff] tracking-widest uppercase px-3 block mb-2">Moderación</span>
                        <button onClick={() => setActiveTab('curator')} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'curator' ? 'bg-[#00d2ff] text-black' : 'text-gray-400 hover:bg-[#161b22] hover:text-white'}`}>
                            📢 Cola de Entrada
                        </button>
                        <button onClick={() => setActiveTab('firebase')} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'firebase' ? 'bg-[#00d2ff] text-black' : 'text-gray-400 hover:bg-[#161b22] hover:text-white'}`}>
                            📊 Noticias Publicadas
                        </button>
                    </div>
                </div>

                {/* Right content */}
                <div className="lg:col-span-9">
                    
                    {activeTab === 'curator' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a1128]/80 p-5 rounded-2xl border border-[#1e293b] flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Noticias Entrantes (Antigravity Intake)</h2>
                                    <p className="text-xs text-gray-400">Cola pendiente de revisión para Jugatela Sports</p>
                                </div>
                                <button 
                                    onClick={async () => {
                                        try {
                                            alert("Obteniendo noticias frescas desde BBC Sport RSS...");
                                            const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/sport/football/rss.xml');
                                            const data = await res.json();
                                            
                                            if (!data.items || data.items.length === 0) {
                                                alert("No se encontraron noticias.");
                                                return;
                                            }

                                            // Map RSS to our News structure and filter duplicates
                                            const existingHeadlines = new Set([...pendingNews, ...approvedNews].map(n => n.headline));
                                            const newItems = data.items
                                                .filter((item: any) => !existingHeadlines.has(item.title))
                                                .slice(0, 10)
                                                .map((item: any) => ({
                                                    tag: 'GLOBAL',
                                                    headline: item.title,
                                                    source_url: item.link,
                                                    tweet_1: item.description?.substring(0, 150) + '...',
                                                    tweet_2: '¿Qué opinas sobre esto? Dejanos tu predicción en Jugatela.',
                                                    tweet_3: 'Sigue toda la acción del fútbol mundial en jugatelasports.com',
                                                    status: 'PENDING'
                                                }));

                                            if (newItems.length === 0) {
                                                alert("No hay noticias nuevas en el servidor. Todas ya fueron descargadas.");
                                                return;
                                            }

                                            const { error } = await supabase.from('news').insert(newItems);
                                            if (error) throw error;
                                            
                                            loadNews();
                                            alert("¡Noticias obtenidas exitosamente!");
                                        } catch (error: any) {
                                            alert("Error al obtener noticias: " + error.message);
                                        }
                                    }}
                                    className="bg-[#1e293b] hover:bg-[#00d2ff] text-white hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    + Sincronizar Noticias (RSS)
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pendingNews.length === 0 && (
                                    <div className="col-span-2 bg-[#161b22]/50 border border-dashed border-gray-800 rounded-2xl p-8 text-center text-xs text-gray-500">
                                        📭 No hay noticias pendientes en la cola.
                                    </div>
                                )}
                                {pendingNews.map(item => (
                                    <div key={item.id} className="bg-[#161b22] rounded-2xl border border-gray-800/80 p-5 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[9px] bg-red-500/10 text-red-400 px-2.5 py-0.5 rounded-full font-bold uppercase">{item.tag}</span>
                                            </div>
                                            <h3 className="text-sm font-bold text-white">{item.headline}</h3>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-800/50 flex gap-2">
                                            <button onClick={() => deletePending(item.id)} className="bg-[#111827] hover:bg-red-500/20 text-gray-400 hover:text-red-400 px-3 py-2 rounded-xl text-xs font-bold transition-all">Rechazar</button>
                                            <button onClick={() => openModeration(item)} className="flex-1 bg-[#1e293b] hover:bg-[#00d2ff] text-white hover:text-black py-2 rounded-xl text-xs font-bold transition-all">Analizar con IA</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {activeItem && (
                                <div className="bg-[#0a1128]/80 rounded-2xl p-6 border border-[#00d2ff]/30 space-y-6">
                                    <div className="flex justify-between items-center border-b border-gray-800 pb-4">
                                        <h3 className="text-sm font-black text-white">ÁREA DE EDICIÓN</h3>
                                        <button onClick={() => setActiveItem(null)} className="text-gray-400 text-xs hover:text-white">✕ Cancelar</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Título:</label>
                                            <input type="text" value={editHeadline} onChange={e => setEditHeadline(e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-xs text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Tag:</label>
                                            <input type="text" value={editTag} onChange={e => setEditTag(e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-xs text-white" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs text-gray-400 mb-1 uppercase font-bold">Link:</label>
                                            <input type="text" value={editSourceUrl} onChange={e => setEditSourceUrl(e.target.value)} className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-xs text-white" />
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-800 pt-6 space-y-4">
                                        <h4 className="text-xs font-bold text-[#00d2ff] uppercase tracking-wider">Copia para Redes Sociales</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {/* Tuit 1 */}
                                            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                                                <textarea value={editTuit1} onChange={e => setEditTuit1(e.target.value)} rows={5} className="w-full bg-black/40 border border-gray-800 rounded-lg p-2.5 text-xs text-white resize-none" />
                                                <button onClick={() => copyTuit(editTuit1)} className="w-full bg-[#1e293b] hover:bg-[#00d2ff] hover:text-black py-1.5 rounded-lg text-[10px] font-bold mt-3 transition-all">Copiar</button>
                                            </div>
                                            {/* Tuit 2 */}
                                            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                                                <textarea value={editTuit2} onChange={e => setEditTuit2(e.target.value)} rows={5} className="w-full bg-black/40 border border-gray-800 rounded-lg p-2.5 text-xs text-white resize-none" />
                                                <button onClick={() => copyTuit(editTuit2)} className="w-full bg-[#1e293b] hover:bg-[#00d2ff] hover:text-black py-1.5 rounded-lg text-[10px] font-bold mt-3 transition-all">Copiar</button>
                                            </div>
                                            {/* Tuit 3 */}
                                            <div className="bg-[#111827] p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
                                                <textarea value={editTuit3} onChange={e => setEditTuit3(e.target.value)} rows={5} className="w-full bg-black/40 border border-gray-800 rounded-lg p-2.5 text-xs text-white resize-none" />
                                                <button onClick={() => copyTuit(editTuit3)} className="w-full bg-[#1e293b] hover:bg-[#00d2ff] hover:text-black py-1.5 rounded-lg text-[10px] font-bold mt-3 transition-all">Copiar</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-800 pt-5 flex justify-end gap-2">
                                        <button onClick={() => deletePending(activeItem.id)} className="bg-red-600/20 text-red-400 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">Rechazar</button>
                                        <button onClick={approveItem} className="bg-gradient-to-r from-[#00d2ff] to-[#0072ff] text-black font-extrabold px-8 py-2.5 rounded-xl text-xs uppercase hover:shadow-[0_0_15px_rgba(0,210,255,0.4)] transition-all">Aprobar e Inyectar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'firebase' && (
                        <div className="space-y-6">
                            <div className="bg-[#0a1128]/80 p-5 rounded-xl border border-[#1e293b]">
                                <h2 className="text-lg font-black text-white uppercase tracking-tight">Noticias Publicadas</h2>
                            </div>
                            <div className="bg-[#161b22] rounded-2xl border border-gray-800 p-6 space-y-4">
                                {approvedNews.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 text-xs">📭 No hay noticias aprobadas.</div>
                                )}
                                {approvedNews.map(item => (
                                    <div key={item.id} className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 flex justify-between items-center gap-4">
                                        <div>
                                            <span className="text-[9px] bg-[#00d2ff]/10 text-[#00d2ff] px-2 py-0.5 rounded font-black">{item.tag}</span>
                                            <h4 className="text-sm font-semibold text-white mt-1">{item.headline}</h4>
                                        </div>
                                        <button onClick={() => deleteApproved(item.id)} className="text-xs text-red-500 hover:text-red-400 hover:underline font-bold">Eliminar</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
