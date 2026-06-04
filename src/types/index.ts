export interface User {
    id: string;
    email?: string;
    name: string;
    firstName?: string;
    lastName?: string;
    nickname?: string;
    nicknameIsPublic?: boolean;
    avatar: string;
    tokens: number;
    points: number;
    level: number;
    streak: number;
    role?: 'ADMIN' | 'USER';
    dni?: string;
    birthDate?: string;
    phone?: string;
    groups: League[];
    inventory: InventoryItem[];
    stats?: {
        accuracy: number;
        avgPoints: number;
        totalConcluded: number;
        wonCount: number;
        lostCount: number;
        streak: number;
        performanceTrend: { date: string; points: number }[];
    };
}

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string; // Will use Lucide icons or image URLs
    category: 'especias' | 'boosters' | 'cosmeticos' | 'premios_fisicos';
    color: string;
    badge?: string;
    legal_terms?: string;
    is_active?: boolean;
}

export interface InventoryItem {
    itemId: string;
    quantity: number;
    purchasedAt: string;
}

export interface League {
    id: string;
    name: string;
    description?: string;
    color: string;
    logo?: string;
    memberIds: string[]; // List of user IDs
    isPublic: boolean;
    adminId: string;
}

export interface Team {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    colors: [string, string]; // Primary, Secondary
}

export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
    id: string;
    name: string;
    number: number;
    position: Position;
    teamId: string;
    photo?: string;
    isStarter?: boolean; // For verification
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export interface Match {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    date: string;
    status: MatchStatus;
    odds: {
        home: number;
        draw: number;
        away: number;
    };
    score?: {
        home: number;
        away: number;
    };
    predictionCounts?: {
        home: number;
        draw: number;
        away: number;
    };
}

export type PredictionOutcome = 'HOME' | 'DRAW' | 'AWAY';
export type PredictionStatus = 'ACTIVE' | 'WON' | 'LOST';

export interface Prediction {
    id: string;
    userId: string;
    matchId: string;
    selection: PredictionOutcome;
    stake: number;
    potentialReturn: number;
    status: PredictionStatus;
    timestamp: string;
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    imageUrl: string;
    category: 'DIGITAL' | 'PHYSICAL' | 'PREMIUM';
}

export interface WalletTransaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAW' | 'WIN' | 'DAILY_BONUS' | 'REDEEM' | 'BET_LOCKED' | 'BET_WIN' | 'BET_REFUND' | 'REWARD_REDEEM' | 'LOSS';
    amount: number;
    description: string;
    date: string; // ISO string
}

export interface Group {
    id: string;
    name: string;
    avatar?: string;
    members: string[]; // User IDs
    lastMessage?: {
        text: string;
        timestamp: string;
        senderName: string;
    };
}

export interface GroupChallenge {
    id: string;
    groupId: string;
    creatorId: string;
    targetId?: string; // If null, open to whole group
    title: string;
    description: string;
    type?: 'FIXED' | 'POOL';
    entryFee?: number;
    reward: string; // e.g., "1 Fernet", "Asado", "500 Tokens"
    status: 'OPEN' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
    participants: {
        userId: string;
        acceptedAt: string;
    }[];
    createdAt: string;
    matchId?: string; // Optional: tied to a specific match or round
}

export interface Opponent {
    id: string;
    name: string;
    avatar: string;
    level: number;
    points: number;
    streak: number;
    isAI: boolean;
    winRate: number;
}

export interface PvpChallenge {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorAvatar: string;
    targetId: string;
    targetName: string;
    targetAvatar: string;
    matchId: string;
    matchHomeTeam: string;
    matchAwayTeam: string;
    amount: number;
    itemReward?: string; // Optional item name like "1 Fernet"
    creatorSelection: PredictionOutcome; // HOME, DRAW or AWAY
    creatorHomeScore: number;
    creatorAwayScore: number;
    targetSelection?: PredictionOutcome; // HOME, DRAW or AWAY
    targetHomeScore?: number;
    targetAwayScore?: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'FINISHED';
    winnerId?: string; // Set when finished
    createdAt: string;
    isBracketChallenge?: boolean;
    bracketState?: any; // JSON representation of the bracket projection
}

export interface MatchPrediction extends Prediction {
    exactScore?: {
        home: number;
        away: number;
    };
    matchDetails?: {
        homeTeam: string;
        awayTeam: string;
        date: string;
        status: 'scheduled' | 'live' | 'finished' | 'UPCOMING' | 'FINISHED';
        actualScore?: {
            home: number;
            away: number;
        };
        betItemId?: string;
        betItemName?: string;
    };
    targetSelection?: 'HOME' | 'DRAW' | 'AWAY';
    targetHomeScore?: number;
    targetAwayScore?: number;
    targetName?: string;
    opponentType?: 'CPU' | 'FRIEND' | 'COMMUNITY' | 'RANDOM';
    opponentId?: string | null;
}

export interface AppNotification {
    id: string;
    userId: string;
    type: 'PVP_INVITE' | 'CHALLENGE_ACCEPTED' | 'CHALLENGE_REJECTED' | 'CHALLENGE_FINISHED' | 'SOCIAL' | 'SYSTEM';
    title: string;
    message: string;
    path: string;
    isRead: boolean;
    createdAt: string;
    metadata?: any;
}

export interface PlayerStats {
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    rating: number;
}

export interface MatchLineup {
    teamId: string;
    formation: string; // e.g. "4-3-3"
    startXI: {
        player: Player;
        pos: string; // e.g. "GK", "DEF", etc.
        grid: string | null; // e.g. "1:1" for visualization
    }[];
    substitutes: {
        player: Player;
    }[];
    staff: {
        name: string;
        role: string;
        photo?: string;
    }[];
}

export interface MatchEvent {
    id: string;
    time: number; // minute
    type: 'GOAL' | 'CARD' | 'SUB' | 'VAR';
    teamId: string;
    player: Player;
    assistPlayer?: Player;
    detail: string; // e.g. "Yellow Card", "Goal", etc.
}

export interface MatchStats {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnGoal: { home: number; away: number };
    passes: { home: number; away: number };
    corners: { home: number; away: number };
}
