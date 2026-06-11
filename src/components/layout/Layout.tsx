import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Zap, Medal, Store, Users, Gift } from 'lucide-react';
import { TokenWallet } from '../ui/TokenWallet';
import { cn } from '../../lib/utils';
import { useUser } from '../../contexts/UserContext';
import { NotificationBell, PvpNotificationToast } from '../ui/NotificationSystem';
import { BottomNavigation } from './BottomNavigation';
import { InstallPrompt } from '../ui/InstallPrompt';
import { StreakBadge } from '../ui/StreakBadge';
import { BonusModal } from '../ui/BonusModal';
import { CategoryFAB } from './CategoryFAB';
import { ProfileCompletionModal } from '../modals/ProfileCompletionModal';
import { WinCelebrationModal } from '../modals/WinCelebrationModal';
import { Footer } from './Footer';
import { databaseService } from '../../services/databaseService';
import { WhatsAppFloat } from '../ui/WhatsAppFloat';

export const Layout: React.FC = () => {
    const { user, dailyBonusAvailable, videoBonusAvailable, socialBonusAvailable, profileIsComplete, updateProfile, signOut, pvpChallenges, userPredictions } = useUser();
    const location = useLocation();
    const navigate = useNavigate();

    // Redirección si no está logueado movida a ProtectedRoute.tsx
    // (Layout ya no bloquea las rutas públicas)

    // OAuth Post-Redirect Redirection Handler
    useEffect(() => {
        if (user) {
            const redirectUrl = sessionStorage.getItem('oauth_redirect_from');
            if (redirectUrl) {
                sessionStorage.removeItem('oauth_redirect_from');
                navigate(redirectUrl, { replace: true });
            }
        }
    }, [user, navigate]);
    
    const [isBonusOpen, setIsBonusOpen] = useState(false);
    const [dismissCompletionModal, setDismissCompletionModal] = useState(() => localStorage.getItem('hideProfileModal') === 'true');
    
    const handleDismissModal = () => {
        setDismissCompletionModal(true);
        localStorage.setItem('hideProfileModal', 'true');
    };
    
    const anyBonusAvailable = dailyBonusAvailable || videoBonusAvailable || socialBonusAvailable;

    // Celebration state
    const [celebrationData, setCelebrationData] = useState<{isOpen: boolean, tokens: number, count: number}>({isOpen: false, tokens: 0, count: 0});
    
    useEffect(() => {
        if (!user) return;
        
        const celebratedStr = localStorage.getItem('celebrated_wins');
        const celebratedIds: string[] = celebratedStr ? JSON.parse(celebratedStr) : [];
        
        let newTokens = 0;
        let newCount = 0;
        let newIds: string[] = [];
        
        // Check PVP Challenges
        pvpChallenges?.forEach(c => {
            if (c.status === 'FINISHED' && c.winnerId === user.id && !celebratedIds.includes(c.id)) {
                newTokens += c.amount * 2;
                newCount++;
                newIds.push(c.id);
            }
        });
        
        // Check User Predictions
        userPredictions?.forEach(p => {
             if (p.status === 'WON' && !celebratedIds.includes(p.id)) {
                 newTokens += (p.potentialReturn || p.stake * 2 || 0);
                 newCount++;
                 newIds.push(p.id);
             }
        });
        
        if (newCount > 0) {
            setCelebrationData({ isOpen: true, tokens: newTokens, count: newCount });
            localStorage.setItem('celebrated_wins', JSON.stringify([...celebratedIds, ...newIds]));
        }
    }, [user, pvpChallenges, userPredictions]);

    // Mostrar modal de completar perfil SOLO para usuarios OAuth sin datos obligatorios
    // No se muestra en las rutas de Auth para no interrumpir el flujo normal
    const isAuthRoute = ['/login', '/register', '/forgot-password'].includes(location.pathname);
    const showCompletionModal = !isAuthRoute && !!user && !profileIsComplete && !dismissCompletionModal;

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
            { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
            { to: '/admin/store', label: 'Admin Tienda', icon: Settings },
            { to: '/admin/sim', label: 'Admin Sim', icon: Zap },
            { to: '/admin/news', label: 'Admin News', icon: Gift }
        ] : [])
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 pb-safe-area-pb flex flex-col">
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
                                <StreakBadge />
                                <TokenWallet />

                                <NotificationBell />

                                <button onClick={() => setIsBonusOpen(true)} className="hidden sm:flex items-center gap-2 p-2 px-3 text-amber-500 hover:text-amber-400 bg-amber-500/10 transition-colors rounded-full hover:bg-amber-500/20 font-bold text-sm">
                                    <Gift className="w-4 h-4" /> Hub 
                                    {anyBonusAvailable && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                </button>

                                <div className="h-8 w-px bg-border hidden md:block" />

                                <Link to="/profile" className="hidden md:flex items-center gap-3 pl-2">
                                    <div className="text-right flex flex-col items-end">
                                        <div className="text-sm font-bold leading-none mb-1 text-white">{user.name}</div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">Nv. {user.level}</div>
                                            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" 
                                                    style={{ width: `${(user.points || 0) % 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-primary/20 ring-2 ring-background hover:scale-110 transition-transform">
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
                "mx-auto flex-1 min-h-[calc(100vh-4rem)] pb-24 md:pb-8",
                isWorldCup ? "w-full px-0 py-0" : "container px-4 py-6 md:py-8"
            )}>
                <Outlet />
            </main>

            {!isAuthRoute && <Footer />}

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
            
            <WhatsAppFloat />
            <PvpNotificationToast />

            {/* Modal de completar perfil para usuarios que entraron con Google */}
            <ProfileCompletionModal
                isOpen={showCompletionModal}
                userName={user?.name}
                onComplete={async (data) => {
                    const { error } = await updateProfile(data);
                    if (error) throw error;
                }}
                onClose={handleDismissModal}
                onSignOut={async () => {
                    await signOut();
                    setDismissCompletionModal(false);
                }}
            />

            <WinCelebrationModal 
                isOpen={celebrationData.isOpen}
                onClose={() => setCelebrationData(prev => ({...prev, isOpen: false}))}
                totalTokens={celebrationData.tokens}
                winCount={celebrationData.count}
            />
        </div >
    );
};
