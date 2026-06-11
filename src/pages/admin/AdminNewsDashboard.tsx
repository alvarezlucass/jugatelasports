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
                                        const { error } = await supabase.from('news').insert([
                                            {
                                                tag: 'ÚLTIMO MOMENTO',
                                                headline: 'Messi confirma que jugará el Mundial 2026',
                                                source_url: 'https://ole.com.ar/messi-2026',
                                                tweet_1: '🚨 MUNDIAL 2026: Messi no se rinde y va por la gloria. ¿Arrugaron los demás?',
                                                tweet_2: 'En la web de Jugatela ya hay apuestas locas. ¿Vos creés que llega bien físicamente?',
                                                tweet_3: 'Dejá de dudar y metete a predecir si pasa de ronda. Registrate y reclamá tus 1000 tokens en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'INFO SELECCIÓN',
                                                headline: 'Dibu Martínez elegido como el mejor arquero del mes',
                                                source_url: 'https://espn.com/dibu',
                                                tweet_1: 'El Dibu sigue haciendo historia. ¿El mejor del mundo actualmente?',
                                                tweet_2: 'A ver quién se anima a apostar en contra de Argentina con el Dibu en el arco en Jugatela.',
                                                tweet_3: 'Apostá por los partidos de Argentina y sumá puntos. Ingresá ya: jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'RUMOR',
                                                headline: 'Mbappé asegura estar listo para vengar a Francia en 2026',
                                                source_url: 'https://www.lequipe.fr/Football/mbappe-2026',
                                                tweet_1: 'Mbappé quiere revancha. 🇫🇷 ¿Francia es el gran candidato para el próximo Mundial?',
                                                tweet_2: '¡Mbappé va por todo! Apostá en Jugatela si pensás que levantan la Copa.',
                                                tweet_3: 'Registrate hoy y elegí a Francia como tu favorito. jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'MERCADO',
                                                headline: 'Inglaterra convoca a su nueva joya de 17 años',
                                                source_url: 'https://www.thesun.co.uk/sport/football/england-new-star',
                                                tweet_1: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Los ingleses apuestan a los jóvenes para 2026. ¿Les alcanzará?',
                                                tweet_2: '¿Creés que Inglaterra rompe su mala racha? Armá tu predicción en Jugatela.',
                                                tweet_3: 'Demostrá cuánto sabés del fútbol inglés prediciendo hoy en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'POLÉMICA',
                                                headline: 'Vinícius Jr critica el formato del próximo Mundial',
                                                source_url: 'https://as.com/futbol/vinicius-critica',
                                                tweet_1: '¡Vini no se guarda nada! 🔥 ¿Tiene razón sobre el nuevo formato del Mundial?',
                                                tweet_2: 'Con o sin polémica, en Jugatela ya podés apostar en los grupos. 🇧🇷',
                                                tweet_3: 'Apostá en los partidos de Brasil y ganá premios increíbles en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'MERCADO',
                                                headline: 'Real Madrid prepara oferta récord por Haaland',
                                                source_url: 'https://www.marca.com/futbol/real-madrid/haaland',
                                                tweet_1: '¿Haaland al Madrid? 😱 El mercado se vuelve loco de cara a la temporada.',
                                                tweet_2: 'Si se da este pase, el Madrid es invencible. ¿Vos qué opinás?',
                                                tweet_3: 'No te quedes afuera, dejá tus predicciones en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'LESIÓN',
                                                headline: 'Alarma en Brasil: Neymar podría perderse el debut',
                                                source_url: 'https://ge.globo.com/futebol/neymar-lesao',
                                                tweet_1: '🚨 ¡Atención Brasil! Neymar no llega al 100%. ¿Se cae el candidato?',
                                                tweet_2: 'Si Ney no juega, cambian todas las cuotas. Aprovechá para apostar en contra en Jugatela.',
                                                tweet_3: 'El Mundial no espera. Armá tu jugada en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'ANÁLISIS',
                                                headline: 'Italy looks to rebuild ahead of World Cup Qualifiers',
                                                source_url: 'https://www.bbc.com/sport/football/italy-rebuild',
                                                tweet_1: '🇮🇹 Italia necesita renacer tras sus últimos fracasos. ¿Lo lograrán?',
                                                tweet_2: '¿Le ponés unas fichas a la Azzurra o los ves fuera otra vez?',
                                                tweet_3: 'Demostrá cuánto sabés del fútbol europeo en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'TÁCTICA',
                                                headline: 'La nuova rivoluzione tattica di Spalletti',
                                                source_url: 'https://www.gazzetta.it/Calcio/Nazionale/spalletti-tattica',
                                                tweet_1: 'Spalletti cambia todo en Italia. ¿Funcionará su nuevo esquema?',
                                                tweet_2: 'El catenaccio quedó atrás. ¿Se viene una Italia ofensiva?',
                                                tweet_3: 'Jugá tus fichas a los partidos europeos en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'ENTREVISTA',
                                                headline: 'Musiala: "Wir wollen den Titel nach Deutschland holen"',
                                                source_url: 'https://www.bild.de/sport/fussball/musiala-interview',
                                                tweet_1: '🇩🇪 Musiala confía en que Alemania vuelve a la cima. ¿Le creés?',
                                                tweet_2: 'Alemania siempre es candidato. ¿O pensás que ya no asustan?',
                                                tweet_3: 'Jugá a seguro o arriesgá en los partidos de Alemania en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'INFO SELECCIÓN',
                                                headline: 'Garnacho pide pista para ser titular en las Eliminatorias',
                                                source_url: 'https://www.tycsports.com/seleccion-argentina/garnacho',
                                                tweet_1: '🇦🇷 El Bichito pide minutos. ¿Scaloni lo pondrá de entrada?',
                                                tweet_2: '¿Garnacho o Di María? Dejanos tu opinión y armá tu equipo ideal.',
                                                tweet_3: 'Apostá en los partidos de La Scaloneta sumando puntos en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'ESTADÍSTICAS',
                                                headline: 'USA Men’s National Team hits historic winning streak',
                                                source_url: 'https://www.cbssports.com/soccer/usmnt-streak',
                                                tweet_1: '🇺🇸 Estados Unidos viene en racha. ¿Son la sorpresa del Mundial?',
                                                tweet_2: 'Ojo con USA que viene calladito. ¿Le apostarías a favor?',
                                                tweet_3: 'No te pierdas los partidos de la Concacaf y jugá en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'RUMOR',
                                                headline: 'Guardiola hints at taking a national team job soon',
                                                source_url: 'https://theathletic.com/football/guardiola-national',
                                                tweet_1: '🧠 Pep Guardiola en una selección. ¿Te imaginás a quién dirigiría?',
                                                tweet_2: 'El tiki-taka a nivel Mundial. Sería increíble de ver.',
                                                tweet_3: 'Anticipate a las noticias y sumá tokens en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'DECLARACIONES',
                                                headline: 'De Bruyne: "This will probably be my last World Cup"',
                                                source_url: 'https://www.skysports.com/football/de-bruyne',
                                                tweet_1: '🇧🇪 El último baile de Kevin De Bruyne. ¿Bélgica la pecheará de nuevo?',
                                                tweet_2: 'La generación dorada de Bélgica se despide. ¿Se irán con las manos vacías?',
                                                tweet_3: 'Hacé tus predicciones sobre el destino de Bélgica en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'INFO SELECCIÓN',
                                                headline: 'Lorenzo prepara sorpresas en la convocatoria cafetera',
                                                source_url: 'https://www.eltiempo.com/deportes/futbol-colombiano',
                                                tweet_1: '🇨🇴 ¿Vuelve James o todo se arma alrededor de Lucho Díaz? El debate en Colombia.',
                                                tweet_2: 'Colombia pisa fuerte en las eliminatorias. ¿Llegan como candidatos?',
                                                tweet_3: 'Apoyá a la tricolor y jugátela en todos sus partidos en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'CRISIS',
                                                headline: 'El Tri busca entrenador tras los malos resultados',
                                                source_url: 'https://www.record.com.mx/futbol-noticias-del-tri',
                                                tweet_1: '🇲🇽 México en crisis a poco del Mundial en casa. ¿Quién debe asumir?',
                                                tweet_2: 'Jugar de local pesa. ¿México pasará al famoso quinto partido?',
                                                tweet_3: 'Demostrá tu conocimiento del Tri apostando en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'ANÁLISIS',
                                                headline: 'Bielsa impone su estilo: La Celeste vuela',
                                                source_url: 'https://www.ovaciondigital.com.uy/futbol/bielsa-uruguay',
                                                tweet_1: '🇺🇾 El Loco Bielsa tiene a Uruguay jugando como nunca. ¿Candidatos top?',
                                                tweet_2: 'Con Valverde y Darwin, Uruguay no le teme a nadie. ¿Apostás por ellos?',
                                                tweet_3: 'Vení a jugar y pronosticá los resultados de La Celeste en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'TÁCTICA',
                                                headline: 'Koeman waarschuwt: "Oranje moet creatiever spelen"',
                                                source_url: 'https://www.telegraaf.nl/sport/voetbal/oranje',
                                                tweet_1: '🇳🇱 Países Bajos necesita más magia. ¿Será el Mundial de Xavi Simons?',
                                                tweet_2: 'La Naranja Mecánica siempre promete pero... ¿cumplirá esta vez?',
                                                tweet_3: 'Si le tenés fe a los de naranja, meté tus fichas en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'RUMOR',
                                                headline: 'Cristiano Ronaldo: O último grande desafio no Mundial',
                                                source_url: 'https://www.abola.pt/Nacional/Noticias/cristiano',
                                                tweet_1: '🇵🇹 ¿Será titular CR7 en su último Mundial? Portugal tiene dudas.',
                                                tweet_2: 'Con Bruno y Bernardo, ¿Portugal necesita a Cristiano? Fuerte debate.',
                                                tweet_3: 'Seguí todos los partidos de los lusos y ganá premios en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'RECAMBIO',
                                                headline: 'La Roja busca desesperadamente a los herederos de la Generación Dorada',
                                                source_url: 'https://www.latercera.com/el-deportivo/la-roja',
                                                tweet_1: '🇨🇱 Chile sufre el recambio. ¿Alcanzará con los destellos de Alexis y Vidal?',
                                                tweet_2: 'El camino de Chile es durísimo. ¿Llegan a clasificar al Mundial?',
                                                tweet_3: 'Armá tu pronóstico de las eliminatorias sudamericanas en jugatelasports.com',
                                                status: 'PENDING'
                                            },
                                            {
                                                tag: 'ESPECIAL',
                                                headline: 'Deschamps sous pression avant le grand tournoi',
                                                source_url: 'https://www.francefootball.fr/news/deschamps-pression',
                                                tweet_1: '🇫🇷 La exigencia en Francia es máxima. Si no ganan, ¿se va Deschamps?',
                                                tweet_2: 'Con el plantel más caro del mundo, Francia es obligación. ¿Apostás a seguro?',
                                                tweet_3: 'Jugatela por los campeones de 2018 y sumá tokens en jugatelasports.com',
                                                status: 'PENDING'
                                            }
                                        ]);
                                        if (error) {
                                            alert("Error al insertar: " + error.message + "\n\n¿Seguro que ejecutaste el archivo supabase_news_schema.sql en tu base de datos?");
                                        } else {
                                            loadNews();
                                        }
                                    }}
                                    className="bg-[#1e293b] hover:bg-[#00d2ff] text-white hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-all"
                                >
                                    + Forzar Noticias Prueba
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
