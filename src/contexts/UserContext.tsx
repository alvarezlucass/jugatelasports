import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, WalletTransaction, Reward, Opponent, MatchPrediction, League, StoreItem, GroupChallenge, PvpChallenge, PredictionOutcome, AppNotification } from '../types';
import type { Session } from '@supabase/supabase-js';
import { calculatePoints } from '../utils/pointsCalculator';
import { ToastContainer, type ToastType } from '../components/ui/NotificationToast';
import { databaseService } from '../services/databaseService';

// Mantenemos la interfaz User compatible con el resto de la app por agilidad, 
// pero internamente mapeamos desde DB
interface UserContextType {
    user: User | null; // Null si no hay sesion
    session: Session | null;
    transactions: WalletTransaction[];
    loading: boolean;
    profileIsComplete: boolean; // true si el perfil tiene todos los datos obligatorios
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
    signUpWithEmail: (email: string, password: string, data: any) => Promise<{ error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    updateProfile: (data: { firstName: string; lastName: string; dni: string; birthDate: string; phone: string }) => Promise<{ error: any }>;
    addLocalPrediction: (prediction: MatchPrediction) => void;

    // Métodos de economía (ahora interactuan con DB o validan localmente)
    addTokens: (amount: number, reason: string) => Promise<void>; 
    spendTokens: (amount: number, reason: string, txType?: 'BET_LOCKED' | 'REWARD_REDEEM') => Promise<any>;
    canAfford: (amount: number) => boolean;
    redeemReward: (reward: Reward) => Promise<void>;

    pvpChallenges: PvpChallenge[];
    createPvpChallenge: (data: Omit<PvpChallenge, 'id' | 'createdAt' | 'status'>) => Promise<boolean>;
    acceptPvpChallenge: (id: string) => Promise<void>;
    rejectPvpChallenge: (id: string) => Promise<void>;
    cancelPvpChallenge: (id: string) => Promise<void>;
    resolvePvpChallenge: (id: string, winnerId: string) => Promise<void>;

    dailyBonusAvailable: boolean;
    claimDailyBonus: () => Promise<void>;
    videoBonusAvailable: boolean;
    claimVideoBonus: () => Promise<void>;
    socialBonusAvailable: boolean;
    claimSocialBonus: () => Promise<void>;
    resendEmailConfirmation: (email: string) => Promise<{ error: any }>;
    resetPassword: (email: string) => Promise<{ error: any }>;
    loginAsGuest: () => Promise<void>;
    loginAsMockUser: (userId: string) => Promise<void>;
    userPredictions: MatchPrediction[];
    opponents: Opponent[];
    purchaseItem: (item: StoreItem) => Promise<{ success: boolean; error?: string }>;
    challenges: GroupChallenge[];
    createChallenge: (challenge: Omit<GroupChallenge, 'id' | 'createdAt' | 'status' | 'participants'>) => Promise<boolean>;
    acceptChallenge: (challengeId: string) => Promise<boolean>;
    resolveChallenge: (challengeId: string, winnerId: string) => Promise<void>;
    useItem: (itemId: string) => Promise<{ success: boolean; error?: string }>;
    notifications: AppNotification[];
    markNotificationAsRead: (notificationId: string) => void;
    showToast: (type: ToastType, title: string, message: string) => void;
    followingIds: string[];
    isFollowing: (userId: string) => boolean;
    toggleFollow: (userId: string) => Promise<void>;
    storeItems: StoreItem[];
}

// Store Catalog is now fetched dynamically from 'store_items' table.

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_AI_OPPONENTS: Opponent[] = [
    { id: 'ai-ia', name: 'IA Analista', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LaIA&backgroundColor=b6e3f4', level: 15, points: 2500, streak: 10, isAI: true, winRate: 0.85 },
    { id: 'ai-profe', name: 'El Profe', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Profe&backgroundColor=ffdfbf', level: 12, points: 1800, streak: 3, isAI: true, winRate: 0.65 },
    { id: 'ai-contra', name: 'El Contra', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Contra&backgroundColor=ffd5dc', level: 8, points: 1200, streak: 0, isAI: true, winRate: 0.45 },
    { id: 'ai-loco', name: 'La Suerte es Loca', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Loco&backgroundColor=c1f7d5', level: 5, points: 500, streak: 0, isAI: true, winRate: 0.33 },
];

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [userPredictions, setUserPredictions] = useState<MatchPrediction[]>(() => {
        const saved = localStorage.getItem('wc_user_predictions');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [opponents, setOpponents] = useState<Opponent[]>(DEFAULT_AI_OPPONENTS);
    const [challenges, setChallenges] = useState<GroupChallenge[]>([]);
    const [pvpChallenges, setPvpChallenges] = useState<PvpChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>(() => {
        const saved = localStorage.getItem('wc_user_notifications');
        try {
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [lastDailyClaim, setLastDailyClaim] = useState<string | null>(null);
    const [lastVideoClaim, setLastVideoClaim] = useState<string | null>(localStorage.getItem('lastVideoClaim'));
    const [lastSocialClaim, setLastSocialClaim] = useState<string | null>(localStorage.getItem('lastSocialClaim'));
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);

    // Toasts for UI feedback
    const [toasts, setToasts] = React.useState<any[]>([]);
    const showToast = (type: ToastType, title: string, message: string) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, title, message }]);
    };

    // 1. Inicializar sesión de Supabase
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setUser(null);
                setPvpChallenges([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Traer perfil y datos relacionados
    const fetchProfile = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;

            if (profile) {
                const firstName = profile.first_name || profile.name?.split(' ')[0] || '';
                const lastName = profile.last_name || '';
                const displayName = profile.nickname && profile.nickname_is_public ? profile.nickname : (firstName || 'Usuario');

                // Cargar inventario
                const { data: invData } = await supabase
                    .from('user_inventory')
                    .select('*')
                    .eq('user_id', userId);

                const mappedInventory = invData ? invData.map(i => ({
                    itemId: i.item_id,
                    quantity: i.quantity || 0,
                    purchasedAt: i.updated_at || new Date().toISOString()
                })) : [];

                // Determinar el rol: Prioridad a la DB, respaldo por Email oficial
                const systemRole: 'ADMIN' | 'USER' = 
                    (profile.role === 'ADMIN' || profile.email === 'admin@jugatelasports.com') 
                    ? 'ADMIN' 
                    : 'USER';

                setUser({
                    id: profile.id,
                    name: displayName,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    nickname: profile.nickname,
                    nicknameIsPublic: profile.nickname_is_public,
                    email: profile.email,
                    avatar: profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`,
                    tokens: profile.total_balance,
                    points: profile.points || 0,
                    level: profile.level || 1,
                    streak: profile.streak || 0,
                    role: systemRole,
                    dni: profile.dni || undefined,
                    birthDate: profile.birth_date || undefined,
                    phone: profile.phone || undefined,
                    groups: [], // Se cargan por separado si es necesario
                    inventory: mappedInventory
                });


                // Cargar transacciones
                const { data: txs } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (txs) {
                    setTransactions(txs.map(t => ({
                        id: t.id,
                        type: t.type as WalletTransaction['type'],
                        amount: t.amount,
                        description: t.description,
                        date: t.created_at
                    })));

                    const lastBonus = txs.find(t => t.type === 'DAILY_BONUS');
                    if (lastBonus) setLastDailyClaim(lastBonus.created_at);
                }

                await fetchPredictions(userId);
                await fetchPvpChallenges(userId);
                await fetchOpponents(userId);
                await fetchFollowing(userId);
                await fetchStoreItems();
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStoreItems = async () => {
        const { data, error } = await supabase
            .from('store_items')
            .select('*')
            .eq('is_active', true);
        
        if (!error && data) {
            setStoreItems(data.map(i => ({
                id: i.id,
                name: i.name,
                description: i.description,
                price: i.price,
                icon: i.icon,
                category: i.category as any,
                color: i.color,
                badge: i.badge || undefined
            })));
        }
    };

    const fetchOpponents = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, nickname, nickname_is_public, avatar_url, points, level, streak')
                .neq('id', userId)
                .order('points', { ascending: false })
                .limit(50);

            if (!error && data) {
                const realOpponents: Opponent[] = data.map(p => ({
                    id: p.id,
                    name: p.nickname && p.nickname_is_public ? p.nickname : (p.first_name || 'Competidor'),
                    avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
                    level: p.level || 1,
                    points: p.points || 0,
                    streak: p.streak || 0,
                    isAI: false,
                    winRate: 0.5
                }));

                setOpponents([...DEFAULT_AI_OPPONENTS, ...realOpponents]);
            } else {
                // En caso de error de red o RLS, al menos mantenemos los AIs
                setOpponents(DEFAULT_AI_OPPONENTS);
            }
        } catch (e) {
            setOpponents(DEFAULT_AI_OPPONENTS);
        }
    };

    const fetchPredictions = async (userId: string) => {
        const { data: preds, error } = await supabase
            .from('predictions')
            .select('*, matches(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && preds) {
            const mapped: MatchPrediction[] = preds.map(p => ({
                id: p.id,
                userId: p.user_id,
                matchId: p.match_id,
                selection: p.selection,
                stake: p.stake,
                potentialReturn: p.potential_return,
                status: p.status,
                timestamp: p.created_at,
                exactScore: p.home_score_pred !== undefined && p.away_score_pred !== undefined ? { home: p.home_score_pred, away: p.away_score_pred } : undefined,
                matchDetails: p.matches ? {
                    homeTeam: p.matches.home_team,
                    awayTeam: p.matches.away_team,
                    date: p.matches.start_time,
                    status: p.matches.status,
                    actualScore: {
                        home: p.matches.home_score || 0,
                        away: p.matches.away_score || 0
                    }
                } : undefined
            }));
            setUserPredictions(mapped);
            localStorage.setItem('wc_user_predictions', JSON.stringify(mapped));
        }
    };

    const fetchPvpChallenges = async (userId: string) => {
        const { data, error } = await supabase
            .from('pvp_challenges')
            .select('*')
            .or(`creator_id.eq.${userId},target_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPvpChallenges(data.map(c => ({
                id: c.id,
                creatorId: c.creator_id,
                creatorName: c.creator_name,
                creatorAvatar: c.creator_avatar || '',
                targetId: c.target_id,
                targetName: c.target_name,
                targetAvatar: c.target_avatar || '',
                matchId: c.match_id,
                matchHomeTeam: c.match_home_team,
                matchAwayTeam: c.match_away_team,
                amount: c.amount,
                itemReward: c.item_reward || undefined,
                creatorSelection: c.creator_selection,
                creatorHomeScore: c.creator_home_score,
                creatorAwayScore: c.creator_away_score,
                status: c.status,
                winnerId: c.winner_id || undefined,
                createdAt: c.created_at
            })));
        }
    };

    const fetchFollowing = async (userId: string) => {
        const { data, error } = await databaseService.getFollowing(userId);
        if (!error) setFollowingIds(data);
    };

    // Auth Handlers
    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUpWithEmail = async (email: string, password: string, data: any) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: `${data.firstName} ${data.lastName}`,
                    first_name: data.firstName,
                    last_name: data.lastName,
                    nickname: data.nickname,
                    nickname_is_public: data.nicknameIsPublic,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
                    dni: data.dni,
                    birth_date: data.birthDate
                }
            }
        });
        return { error };
    };

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    };

    const updateProfile = async (data: { firstName: string; lastName: string; dni: string; birthDate: string; phone: string }) => {
        if (!session?.user.id) return { error: new Error('No hay sesión activa') };
        const { error } = await supabase.from('profiles').update({
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            dni: data.dni,
            birth_date: data.birthDate,
            phone: data.phone,
        }).eq('id', session.user.id);
        if (!error) await refreshProfile();
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setTransactions([]);
    };

    const refreshProfile = async () => {
        if (session?.user.id) await fetchProfile(session.user.id);
    };

    // Mock Login
    const loginAsGuest = async () => {
        setUser({
            id: 'guest-123',
            name: 'Invitado',
            firstName: 'Invitado',
            lastName: 'Prueba',
            email: 'guest@demo.com',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
            tokens: 5000,
            points: 0,
            level: 1,
            streak: 0,
            groups: [],
            inventory: []
        });
    };

    const loginAsMockUser = async (userId: string) => {
        const op = opponents.find(o => o.id === userId);
        if (op) {
            setUser({
                id: op.id,
                name: op.name,
                firstName: op.name,
                lastName: '',
                email: `${op.id}@demo.com`,
                avatar: op.avatar,
                tokens: 1000,
                points: op.points,
                level: op.level,
                streak: op.streak,
                groups: [],
                inventory: []
            });
        }
    };

    // Economy Logic
    const addTokens = async (amount: number, reason: string) => {
        if (!user || !session) return;
        
        const newTotal = user.tokens + amount;
        const { error } = await supabase.from('transactions').insert({
            user_id: user.id,
            type: 'DEPOSIT',
            amount: amount,
            description: reason,
            balance_type: 'REDEEMABLE',
            balance_after: newTotal
        });

        if (!error) {
            await supabase.from('profiles').update({
                total_balance: newTotal,
                redeemable_balance: (user.tokens || 0) + amount // Simplified for this logic
            }).eq('id', user.id);
            await refreshProfile();
        }
    };

    const spendTokens = async (
        amount: number, 
        reason: string, 
        txType: 'BET_LOCKED' | 'REWARD_REDEEM' = 'BET_LOCKED'
    ): Promise<string | null> => {
        if (!user || user.tokens < amount || !session) return null;

        const newTotal = user.tokens - amount;
        const { data, error } = await supabase.from('transactions').insert({
            user_id: user.id,
            type: txType,
            amount: -amount,
            description: reason,
            balance_after: newTotal
        }).select('id').single();

        if (!error && data) {
            await supabase.from('profiles').update({ total_balance: newTotal }).eq('id', user.id);
            await refreshProfile();
            return data.id;
        }
        return null;
    };

    const canAfford = (amount: number) => (user?.tokens || 0) >= amount;

    const redeemReward = async (reward: Reward) => {
        await spendTokens(reward.cost, `Canje: ${reward.name}`, 'REWARD_REDEEM');
    };

    // Challenges Logic
    const createPvpChallenge = async (data: Omit<PvpChallenge, 'id' | 'createdAt' | 'status'>) => {
        if (!user || !session) return false;
        
        const transactionId = await spendTokens(data.amount, `Reto PVP a ${data.targetName}`);
        if (!transactionId) return false;

        const { error } = await supabase.from('pvp_challenges').insert({
            creator_id: data.creatorId,
            creator_name: data.creatorName,
            creator_avatar: data.creatorAvatar,
            target_id: data.targetId,
            target_name: data.targetName,
            target_avatar: data.targetAvatar,
            match_id: data.matchId,
            match_home_team: data.matchHomeTeam,
            match_away_team: data.matchAwayTeam,
            amount: data.amount,
            item_reward: data.itemReward || null,
            creator_selection: data.creatorSelection,
            creator_home_score: data.creatorHomeScore,
            creator_away_score: data.creatorAwayScore,
            status: 'PENDING'
        });

        if (!error) {
            await fetchPvpChallenges(user.id);
            return true;
        }
        return false;
    };

    const acceptPvpChallenge = async (id: string) => {
        if (!user || !session) return;
        const challenge = pvpChallenges.find(c => c.id === id);
        if (challenge && challenge.amount > 0) {
            const transactionId = await spendTokens(challenge.amount, `Reto acepado vs ${challenge.creatorName}`);
            if (!transactionId) return;
        }
        await supabase.from('pvp_challenges').update({ status: 'ACCEPTED' }).eq('id', id);
        await fetchPvpChallenges(user.id);
    };

    const rejectPvpChallenge = async (id: string) => {
        if (session) await supabase.from('pvp_challenges').update({ status: 'REJECTED' }).eq('id', id);
        await fetchPvpChallenges(user!.id);
    };

    const cancelPvpChallenge = async (id: string) => {
        const challenge = pvpChallenges.find(c => c.id === id);
        if (challenge && challenge.status === 'PENDING') {
            await addTokens(challenge.amount, `Reembolso reto cancelado`);
            await supabase.from('pvp_challenges').delete().eq('id', id);
            await fetchPvpChallenges(user!.id);
        }
    };

    const resolvePvpChallenge = async (id: string, winnerId: string) => {
        const challenge = pvpChallenges.find(c => c.id === id);
        if (challenge && winnerId === user?.id) {
            await addTokens(challenge.amount * 2, `Premio PVP vs ${challenge.creatorName}`);
        }
        await supabase.from('pvp_challenges').update({ status: 'FINISHED', winner_id: winnerId }).eq('id', id);
        await fetchPvpChallenges(user!.id);
    };

    // Store Logic
    const purchaseItem = async (item: StoreItem): Promise<{ success: boolean; transactionId?: string }> => {
        if (!user || !session) return { success: false };
        const transactionId = await spendTokens(item.price, `Compra: ${item.name}`, 'REWARD_REDEEM');
        if (transactionId) {
            await supabase.from('user_inventory').upsert({
                user_id: user.id,
                item_id: item.id,
                quantity: (user.inventory.find(i => i.itemId === item.id)?.quantity || 0) + 1
            });
            await refreshProfile();
            return { success: true, transactionId };
        }
        return { success: false };
    };

    const useItem = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
        if (!user || !session) return { success: false, error: 'No hay sesión activa' };

        const itemInInv = user.inventory.find(i => i.itemId === itemId);
        if (!itemInInv || itemInInv.quantity <= 0) {
            return { success: false, error: 'No tienes este item en tu inventario' };
        }

        const newQuantity = itemInInv.quantity - 1;

        try {
            if (newQuantity <= 0) {
                // Eliminar registro si ya no quedan
                const { error } = await supabase
                    .from('user_inventory')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('item_id', itemId);
                if (error) throw error;
            } else {
                // Actualizar cantidad
                const { error } = await supabase
                    .from('user_inventory')
                    .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
                    .eq('user_id', user.id)
                    .eq('item_id', itemId);
                if (error) throw error;
            }

            await refreshProfile();
            return { success: true };
        } catch (error: any) {
            console.error('Error al usar item:', error);
            return { success: false, error: error.message };
        }
    };

    // Bonuses
    const dailyBonusAvailable = !lastDailyClaim || new Date(lastDailyClaim).getDate() !== new Date().getDate();
    const videoBonusAvailable = !lastVideoClaim || new Date(lastVideoClaim).getDate() !== new Date().getDate();
    const socialBonusAvailable = !lastSocialClaim || (new Date().getTime() - new Date(lastSocialClaim).getTime() > 1000 * 60 * 60 * 24 * 7);

    const claimDailyBonus = async () => {
        if (dailyBonusAvailable) {
            await addTokens(50, 'Bono Diario');
            setLastDailyClaim(new Date().toISOString());
        }
    };

    const claimVideoBonus = async () => {
        await addTokens(20, 'Bono Video');
        setLastVideoClaim(new Date().toISOString());
    };

    const claimSocialBonus = async () => {
        await addTokens(100, 'Bono Social');
        setLastSocialClaim(new Date().toISOString());
    };

    // Social Logic
    const isFollowing = (id: string) => followingIds.includes(id);
    const toggleFollow = async (id: string) => {
        if (!user) return;
        if (isFollowing(id)) {
            await databaseService.unfollowUser(user.id, id);
            setFollowingIds(prev => prev.filter(x => x !== id));
        } else {
            await databaseService.followUser(user.id, id);
            setFollowingIds(prev => [...prev, id]);
        }
    };

    // Helpers
    const markNotificationAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const addLocalPrediction = (prediction: MatchPrediction) => {
        setUserPredictions(prev => [prediction, ...prev]);
    };

    // Other methods placeholders to keep interface happy
    const resendEmailConfirmation = async (email: string) => ({ error: null });
    const resetPassword = async (email: string) => ({ error: null });
    const createChallenge = async () => true;
    const acceptChallenge = async () => true;
    const resolveChallenge = async () => {};

    // Determinar si el perfil está completo (tiene DNI y fecha de nacimiento cargados)
    const profileIsComplete = !user || !!(user.dni && user.birthDate);

    return (
        <UserContext.Provider value={{
            user, session, transactions, loading,
            profileIsComplete,
            signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshProfile, updateProfile,
            addTokens, spendTokens, canAfford, redeemReward,
            pvpChallenges, createPvpChallenge, acceptPvpChallenge, rejectPvpChallenge, cancelPvpChallenge, resolvePvpChallenge,
            dailyBonusAvailable, claimDailyBonus, videoBonusAvailable, claimVideoBonus, socialBonusAvailable, claimSocialBonus,
            resendEmailConfirmation, resetPassword, loginAsGuest, loginAsMockUser,
            userPredictions, opponents, purchaseItem, useItem,
            challenges, createChallenge, acceptChallenge, resolveChallenge,
            notifications, markNotificationAsRead, showToast,
            followingIds, isFollowing, toggleFollow, addLocalPrediction,
            storeItems
        }}>
            {children}
            <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) throw new Error('useUser must be used within a UserProvider');
    return context;
};
