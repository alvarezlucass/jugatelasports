const fs = require('fs');
const filePath = 'src/contexts/UserContext.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Regex for fetchPredictions inner block
const searchRegex = /setUserPredictions\(preds\.map\(p => \(\{[\s\S]*?\}\)\)\);[\s\S]*?\}/;
const replacement = `const mapped: MatchPrediction[] = preds.map(p => ({
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
        }`;

if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacement);
    
    // Also add the return [] at the end of function
    content = content.replace(/await fetchPvpChallenges\(userId\);\s*\}\s*\}/, `await fetchPvpChallenges(userId);\n        }\n        return [];\n    }`);
    
    fs.writeFileSync(filePath, content);
    console.log('UserContext.tsx updated successfully');
} else {
    console.log('Regex match failed');
}
