const fs = require('fs');
const path = require('path');

const filePath = 'f:\\PredictionGames\\Predicciones\\src\\contexts\\UserContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Refactor fetchPredictions to return data
const fetchPredictionsOld = /const fetchPredictions = async \(userId: string\) => \{[\s\S]*?setUserPredictions\(preds\.map\(p => \(\{[\s\S]*?\}\)\)\);[\s\S]*?\}[\s\S]*?\};/;
const fetchPredictionsNew = `const fetchPredictions = async (userId: string) => {
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
                exactScore: p.metadata?.exact_score,
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
            return mapped;
        }
        return [];
    };`;

content = content.replace(/const fetchPredictions = async \(userId: string\) => \{[\s\S]*?setUserPredictions\(preds\.map\(p => \(\{[\s\S]*?\}\)\)\);[\s\S]*?\}[\s\S]*?\};/, fetchPredictionsNew);

// 2. Update fetchProfile to calculate stats
// We'll replace the block from setUser until the end of the sequence
const fetchProfileBlockOld = /setUser\(\{[\s\S]*?await fetchFollowing\(userId\);/;
const fetchProfileBlockNew = `// Cargar predicciones locales
                const userPreds = await fetchPredictions(userId);

                // Motor de Analíticas Industriales
                const concluded = userPreds.filter(p => p.status === 'WON' || p.status === 'LOST');
                const wins = concluded.filter(p => p.status === 'WON').length;
                const accuracy = concluded.length > 0 ? Math.round((wins / concluded.length) * 100) : 0;
                const totalPoints = concluded.reduce((acc, p) => acc + (p.status === 'WON' ? (p.potentialReturn || 0) : 0), 0);
                const avgPoints = concluded.length > 0 ? Math.round(totalPoints / concluded.length) : 0;
                const trend = [...concluded].reverse().slice(0, 10).map(p => ({
                    date: p.timestamp,
                    points: p.status === 'WON' ? (p.potentialReturn || 0) : 0
                }));

                const stats = {
                    accuracy,
                    avgPoints,
                    totalConcluded: concluded.length,
                    wonCount: wins,
                    lostCount: concluded.length - wins,
                    streak: profile.streak || 0,
                    performanceTrend: trend
                };

                setUser({
                    id: profile.id,
                    name: displayName,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    nickname: profile.nickname,
                    nicknameIsPublic: profile.nickname_is_public,
                    email: profile.email,
                    avatar: profile.avatar_url || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${profile.id}\`,
                    tokens: profile.total_balance,
                    points: profile.points || 0,
                    level: profile.level || 1,
                    streak: profile.streak || 0,
                    groups: [
                        { id: 'g1', name: 'Prode Oficina', color: 'blue', memberIds: [userId, 'u-2', 'u-3'], isPublic: false, adminId: 'u-2' },
                        { id: 'g2', name: 'Los Pibes del Fulbo', color: 'green', memberIds: [userId, 'u-3'], isPublic: true, adminId: userId }
                    ],
                    inventory: mappedInventory,
                    stats
                });

                // Cargar retos PvP desde Supabase
                await fetchPvpChallenges(userId);

                // Cargar oponentes reales desde profiles (excluye al usuario actual)
                await fetchOpponents(userId);

                // Cargar seguidores
                await fetchFollowing(userId);`;

content = content.replace(/setUser\(\{[\s\S]*?await fetchFollowing\(userId\);/, fetchProfileBlockNew);

fs.writeFileSync(filePath, content);
console.log('UserContext.tsx updated successfully via script.');
