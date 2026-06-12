const { getGroupStandings } = require('./dist_test/worldCupPersistence.js');

const realMatches = [
    { 
        id: '1158072', 
        api_id: null, 
        home_team: 'México', 
        away_team: 'Sudáfrica', 
        status: 'FINISHED', 
        home_score: 2, 
        away_score: 0 
    }
];

const standings = getGroupStandings('A', [], realMatches);
console.log(JSON.stringify(standings, null, 2));
