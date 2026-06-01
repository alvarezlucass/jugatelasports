import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Zap, Store, Settings, Medal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';

export const BottomNavigation = () => {
    const { user } = useUser();

    const navLinks = [
        { to: '/', label: 'Inicio', icon: LayoutDashboard },
        { to: '/predictions', label: 'Jugadas', icon: Zap },
        { to: '/rankings', label: 'Ranking', icon: Medal },
        { to: '/store', label: 'Tienda', icon: Store },
        ...(user?.role === 'ADMIN' ? [{ to: '/admin/store', label: 'Admin', icon: Settings }] : []),
        { to: '/profile', label: 'Perfil', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 md:hidden safe-area-pb">
            <div className="flex justify-around items-center h-16">
                {navLinks.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
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
                                    <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] font-medium">{label}</span>
                                <span className={cn(
                                    "absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_2px_8px_rgba(var(--primary),0.5)] transition-all duration-300",
                                    isActive ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
                                )} />
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};
