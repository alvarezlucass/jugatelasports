import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Zap, Store, Settings, Medal, Newspaper, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

export const BottomNavigation = () => {
    const { user } = useUser();
    const [showAdminMenu, setShowAdminMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowAdminMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navLinks = [
        { to: '/', label: 'Inicio', icon: LayoutDashboard },
        { to: '/predictions', label: 'Jugadas', icon: Zap },
        { to: '/rankings', label: 'Ranking', icon: Medal },
        { to: '/store', label: 'Tienda', icon: Store },
        ...(user?.role === 'ADMIN' ? [
            { id: 'admin', label: 'Admin', icon: Settings, isMenu: true }
        ] : []),
        { to: '/profile', label: 'Perfil', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 md:hidden safe-area-pb">
            <div className="flex justify-around items-center h-16 relative">
                {navLinks.map((item) => {
                    if (item.isMenu) {
                        return (
                            <div key={item.id} className="relative flex flex-col items-center justify-center w-full h-full" ref={menuRef}>
                                <button
                                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                                    className={cn(
                                        "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors relative active:scale-95 duration-200",
                                        showAdminMenu ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1.5 rounded-2xl transition-all duration-300",
                                        showAdminMenu && "bg-primary/10"
                                    )}>
                                        <item.icon className={cn("w-5 h-5", showAdminMenu && "fill-primary/20")} strokeWidth={showAdminMenu ? 2.5 : 2} />
                                    </div>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </button>

                                {showAdminMenu && (
                                    <div className="absolute bottom-16 right-0 bg-[#1A1F26] border border-white/10 rounded-2xl p-2 flex flex-col gap-1 shadow-2xl mb-2 min-w-[160px] animate-in slide-in-from-bottom-2 fade-in">
                                        <NavLink to="/admin/store" onClick={() => setShowAdminMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 rounded-xl whitespace-nowrap text-white font-bold transition-colors">
                                            <Store className="w-4 h-4 text-blue-400" /> Admin Tienda
                                        </NavLink>
                                        <NavLink to="/admin/sim" onClick={() => setShowAdminMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 rounded-xl whitespace-nowrap text-white font-bold transition-colors">
                                            <Cpu className="w-4 h-4 text-purple-400" /> Simulación
                                        </NavLink>
                                        <NavLink to="/admin/news" onClick={() => setShowAdminMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 rounded-xl whitespace-nowrap text-white font-bold transition-colors">
                                            <Newspaper className="w-4 h-4 text-amber-400" /> Noticias
                                        </NavLink>
                                        <NavLink to="/admin/dashboard" onClick={() => setShowAdminMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 rounded-xl whitespace-nowrap text-white font-bold transition-colors">
                                            <LayoutDashboard className="w-4 h-4 text-emerald-400" /> Dashboard
                                        </NavLink>
                                    </div>
                                )}
                            </div>
                        );
                    }

                    return (
                        <NavLink
                            key={item.to}
                            to={item.to!}
                            className={({ isActive }) => cn(
                                "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors relative active:scale-95 duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={cn(
                                        "p-1.5 rounded-2xl transition-all duration-300",
                                        isActive && "bg-primary/10"
                                    )}>
                                        <item.icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                    <span className={cn(
                                        "absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary),0.5)] transition-all duration-300",
                                        isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                                    )} />
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
};
