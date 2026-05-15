import React, { useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, Zap, Medal, Store, Users, Gift } from 'lucide-react';
import { TokenWallet } from '../ui/TokenWallet';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';
import { NotificationSimulator } from '../debug/NotificationSimulator';
import { NotificationBell, PvpNotificationToast } from '../ui/NotificationSystem';
import { BottomNavigation } from './BottomNavigation';
import { InstallPrompt } from '../ui/InstallPrompt';
import { BonusModal } from '../ui/BonusModal';
import { CategoryFAB } from './CategoryFAB';
import { ProfileCompletionModal } from '../modals/ProfileCompletionModal';

export const Layout: React.FC = () => {
    const { user, dailyBonusAvailable, videoBonusAvailable, socialBonusAvailable, profileIsComplete, updateProfile } = useUser();
    const location = useLocation();
    
    const [isBonusOpen, setIsBonusOpen] = useState(false);
    
    const anyBonusAvailable = dailyBonusAvailable || videoBonusAvailable || socialBonusAvailable;

    // Mostrar modal de completar perfil SOLO para usuarios OAuth sin datos obligatorios
    // No se muestra en las rutas de Auth para no interrumpir el flujo normal
    const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);
    const showCompletionModal = !isAuthRoute && !!user && !profileIsComplete;

    const isWorldCup = location.pathname === '/worldcup';
    const isHome = location.pathname === '/' || location.pathname === '/home';

    const navLinks = [
        { to: '/', label: 'Inicio', icon: LayoutDashboard },
        { to: '/predictions', label: 'Jugadas', icon: Zap },
        { to: '/groups', label: 'Grupos', icon: Users },
        { to: '/rankings', label: 'Ranking', icon: Medal },
        { to: '/store', label: 'Tienda', icon: Store },
        // ACCESO ADMINISTRADOR
        ...(user?.role === 'ADMIN' ? [
            { to: '/admin/store', label: 'Admin Tienda', icon: Settings },
            { to: '/admin/sim', label: 'Admin Sim', icon: Zap }
        ] : [])
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 pb-safe-area-pb">
            {/* Top Navigation Bar - Compact on mobile */}
            <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 mr-8">
                        <img
                            src="/Escudo.jpg"
                            alt="Jugatela Sports"
                            className="w-10 h-10 object-contain rounded-lg shadow-lg shadow-primary/10"
                        />
                        <span className="text-xl font-bold tracking-tight text-foreground hidden sm:block">
                            Jugatela Sports
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6 mr-auto">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) => cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-3 md:gap-4">
                        {user ? (
                            <>
                                <TokenWallet />

                                <NotificationBell />

                                <button onClick={() => setIsBonusOpen(true)} className="hidden sm:flex items-center gap-2 p-2 px-3 text-amber-500 hover:text-amber-400 bg-amber-500/10 transition-colors rounded-full hover:bg-amber-500/20 font-bold text-sm">
                                    <Gift className="w-4 h-4" /> Hub 
                                    {anyBonusAvailable && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                </button>

                                <div className="h-8 w-px bg-border hidden md:block" />

                                <Link to="/profile" className="hidden md:flex items-center gap-3 pl-2">
                                    <div className="text-right">
                                        <div className="text-sm font-medium leading-none">{user.name}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">Lvl {user.level}</div>
                                    </div>
                                    <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 ring-2 ring-background">
                                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 py-2 rounded-lg font-bold text-sm transition-colors">
                                    Ingresar
                                </Link>
                                <Link to="/register" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-primary/20">
                                    Registrarse
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header >

            {/* Main Content - Added padding bottom for mobile nav */}
            <main className={cn(
                "mx-auto min-h-[calc(100vh-4rem)] pb-24 md:pb-8",
                isWorldCup ? "w-full px-0 py-0" : "container px-4 py-6 md:py-8"
            )}>
                <Outlet />
            </main>

            {/* Bottom Navigation for Mobile */}
            <BottomNavigation />
            <InstallPrompt />

            {/* Daily Bonus FAB - Adjusted position for bottom nav */}
            {
                user && (
                    <button
                        onClick={() => setIsBonusOpen(true)}
                        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-40 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform flex items-center gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-5"
                    >
                        <span className="text-lg md:text-xl relative inline-block">
                            🎁
                           {anyBonusAvailable && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-orange-600 animate-pulse" />}
                        </span>
                        <span className="font-bold text-sm md:text-base hidden sm:inline-block">Bonus</span>
                    </button>
                )
            }

            {!isHome && <CategoryFAB />}

            <BonusModal isOpen={isBonusOpen} onClose={() => setIsBonusOpen(false)} />
            
            {user?.role === 'ADMIN' && <NotificationSimulator />}
            <PvpNotificationToast />

            {/* Modal de completar perfil para usuarios que entraron con Google */}
            <ProfileCompletionModal
                isOpen={showCompletionModal}
                userName={user?.name}
                onComplete={async (data) => {
                    const { error } = await updateProfile(data);
                    if (error) throw error;
                }}
            />
        </div >
    );
};
