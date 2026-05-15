import React, { useEffect, useState, useRef } from 'react';
import { databaseService } from '../../services/databaseService';
import { useUser } from '../../contexts/UserContext';
import { Send, MessageSquare, User, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
    id: string;
    user_id: string;
    user_nickname: string;
    user_avatar: string;
    content: string;
    created_at: string;
}

export const MatchChat: React.FC<{ matchId: string }> = ({ matchId }) => {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const loadComments = async () => {
        const { data, error } = await databaseService.fetchComments(matchId);
        if (!error && data) {
            setComments(data as Comment[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadComments();
        const interval = setInterval(loadComments, 10000); // Polling cada 10s
        return () => clearInterval(interval);
    }, [matchId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        const { success, data } = await databaseService.addComment(
            matchId,
            user.id,
            user.name || 'Usuario',
            user.avatar || '',
            newComment.trim()
        );

        if (success && data) {
            setComments(prev => [...prev, data as Comment]);
            setNewComment('');
        }
    };

    return (
        <div className="flex flex-col h-[500px] bg-[#0F131A]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                        <MessageSquare size={20} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Tribuna en Vivo</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Comenta con la comunidad</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{comments.length} Mensajes</span>
                </div>
            </div>

            {/* Messages Area */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/5 [&::-webkit-scrollbar-track]:bg-transparent"
            >
                {loading && comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20 space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Abriendo tribuna...</p>
                    </div>
                ) : comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <MessageSquare size={32} className="text-zinc-600" />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Nadie ha comentado aún.<br/>¡Sé el primero!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div 
                            key={comment.id} 
                            className={cn(
                                "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                                comment.user_id === user?.id ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 shrink-0">
                                <img src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className={cn(
                                "max-w-[80%] space-y-1",
                                comment.user_id === user?.id ? "items-end" : "items-start"
                            )}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tight">{comment.user_nickname}</span>
                                    <span className="text-[7px] font-bold text-zinc-700 uppercase">{formatDistanceToNow(new Date(comment.created_at), { locale: es })}</span>
                                </div>
                                <div className={cn(
                                    "p-3 rounded-2xl text-xs font-medium leading-relaxed",
                                    comment.user_id === user?.id 
                                        ? "bg-blue-600 text-white rounded-tr-none" 
                                        : "bg-white/5 text-zinc-300 border border-white/5 rounded-tl-none"
                                )}>
                                    {comment.content}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-6 bg-black/20 border-t border-white/5">
                <div className="relative group">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe algo en la tribuna..."
                        className="w-full bg-[#1A1F26] border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-xs text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all focus:ring-4 focus:ring-blue-500/5"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-zinc-800 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </form>
        </div>
    );
};
