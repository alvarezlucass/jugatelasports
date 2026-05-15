const fs = require('fs');
const path = require('path');

const srcData = path.join(__dirname, '../src/data/history/mundial_qatar_2022.json');
const outMatches = path.join(__dirname, '../src/data/history/2022/matches.json');
const outSquads = path.join(__dirname, '../src/data/history/2022/squads.json');

const rawData = JSON.parse(fs.readFileSync(srcData, 'utf-8')).mundial;
const existingSquads = JSON.parse(fs.readFileSync(outSquads, 'utf-8'));

const teamFlags = {
  "Qatar": 1569, "Ecuador": 2382, "Senegal": 13, "Países Bajos": 1118,
  "Inglaterra": 10, "Irán": 22, "Estados Unidos": 2384, "Gales": 767,
  "Argentina": 26, "Arabia Saudita": 23, "México": 16, "Polonia": 24,
  "Francia": 2, "Australia": 20, "Dinamarca": 21, "Túnez": 28,
  "España": 9, "Costa Rica": 29, "Alemania": 25, "Japón": 12,
  "Bélgica": 1, "Canadá": 2381, "Marruecos": 31, "Croacia": 3,
  "Brasil": 6, "Serbia": 14, "Suiza": 15, "Camerún": 19,
  "Portugal": 27, "Ghana": 2383, "Uruguay": 7, "Corea del Sur": 17
};

function getFlagUrl(team) {
  const id = teamFlags[team];
  return id ? `https://media.api-sports.io/football/teams/${id}.png` : '';
}

// Generate Matches
const matchesData = { groups: {}, knockout: [] };

// Calculate Standings
const groupsMap = {};
rawData.partidos.forEach(p => {
  if (p.fase === 'Grupos') {
    if (!groupsMap[p.grupo]) {
      groupsMap[p.grupo] = {};
    }
    [p.local, p.visitante].forEach(team => {
      if (!groupsMap[p.grupo][team]) {
        groupsMap[p.grupo][team] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0, form: [] };
      }
    });

    const l = groupsMap[p.grupo][p.local];
    const v = groupsMap[p.grupo][p.visitante];
    
    l.played++; v.played++;
    l.gf += p.resultado.local; l.ga += p.resultado.visitante;
    v.gf += p.resultado.visitante; v.ga += p.resultado.local;

    if (p.resultado.local > p.resultado.visitante) {
      l.won++; l.points += 3; l.form.push('W');
      v.lost++; v.form.push('L');
    } else if (p.resultado.local < p.resultado.visitante) {
      v.won++; v.points += 3; v.form.push('W');
      l.lost++; l.form.push('L');
    } else {
      l.drawn++; l.points += 1; l.form.push('D');
      v.drawn++; v.points += 1; v.form.push('D');
    }
  }
});

for (const g in groupsMap) {
  matchesData.groups[g] = { standings: [] };
  const teamsInGroup = Object.keys(groupsMap[g]).map(t => {
    const st = groupsMap[g][t];
    return {
      team: t,
      played: st.played, won: st.won, drawn: st.drawn, lost: st.lost,
      points: st.points, gf: st.gf, ga: st.ga, gd: st.gf - st.ga,
      form: st.form.slice(-3).join(' ')
    };
  });
  teamsInGroup.sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.gd !== b.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
  
  teamsInGroup.forEach((t, idx) => {
    t.rank = idx + 1;
    matchesData.groups[g].standings.push(t);
  });
}

// Generate Knockouts
const knockoutPhases = {
  "Final": "Final",
  "Tercer Puesto": "Tercer Puesto",
  "Semifinales": "Semi-Finales",
  "Cuartos de Final": "Cuartos de Final",
  "Octavos de Final": "Octavos de Final"
};

const knockoutsMap = {
  "Final": [],
  "Tercer Puesto": [],
  "Semi-Finales": [],
  "Cuartos de Final": [],
  "Octavos de Final": []
};

rawData.partidos.forEach(p => {
  if (p.fase !== 'Grupos' && knockoutPhases[p.fase]) {
    const kMatch = {
      id: parseInt(p.id.replace('P', '')),
      homeTeam: p.local,
      homeFlag: getFlagUrl(p.local),
      awayTeam: p.visitante,
      awayFlag: getFlagUrl(p.visitante),
      score: `${p.resultado.local}-${p.resultado.visitante}`,
      date: `${p.fecha}T${p.hora}:00Z`,
      events: []
    };
    if (p.resultado.penales) {
      kMatch.penalties = `${p.resultado.penales.local}-${p.resultado.penales.visitante}`;
    }
    
    if (p.goles) {
      kMatch.events = p.goles.map(g => ({
        time: `${g.minuto}'`,
        team: g.equipo === p.local ? 'home' : 'away',
        player: g.jugador,
        type: g.tipo.toUpperCase() === 'EN PROPIA' ? 'OWN_GOAL' : (g.tipo.toUpperCase() === 'PENAL' ? 'PENALTY' : 'GOAL')
      }));
    }

    knockoutsMap[knockoutPhases[p.fase]].push(kMatch);
  }
});

Object.keys(knockoutsMap).forEach(k => {
  if (knockoutsMap[k].length > 0) {
    matchesData.knockout.push({
      round: k,
      matches: knockoutsMap[k]
    });
  }
});

fs.writeFileSync(outMatches, JSON.stringify(matchesData, null, 4), 'utf-8');

// Update Squads
const teamCodes = {
  "Argentina": "ARG", "Francia": "FRA", "Croacia": "CRO", "Marruecos": "MAR",
  "Brasil": "BRA", "Portugal": "POR", "Países Bajos": "NED", "Inglaterra": "ENG",
  "España": "ESP", "Japón": "JPN"
};

const newSquads = { teams: [] };

rawData.selecciones.forEach(sel => {
  const existingTeam = existingSquads.teams.find(t => t.name === sel.nombre) || {};
  
  const formattedPlayers = sel.jugadores.map(j => {
    // Try to find photo
    let photoUrl = "https://media.api-sports.io/football/players/default.png"; // Placeholder
    if (existingTeam.squad) {
      const match = existingTeam.squad.find(e => {
         // simple match by last name
         return j.nombre.includes(e.name.split(' ').pop());
      });
      if (match && match.photo) photoUrl = match.photo;
    }

    let pos = "Midfielder";
    if (j.posicion === "Arquero") pos = "Goalkeeper";
    if (j.posicion === "Defensor") pos = "Defender";
    if (j.posicion.includes("Delantero")) pos = "Attacker";

    return {
      number: j.numero,
      name: j.nombre,
      position: pos,
      photo: photoUrl
    };
  });

  let coachPhoto = "";
  if (existingTeam.coach && existingTeam.coach.photo) coachPhoto = existingTeam.coach.photo;

  newSquads.teams.push({
    id: `team-${teamCodes[sel.nombre] ? teamCodes[sel.nombre].toLowerCase() : sel.nombre.toLowerCase()}`,
    name: sel.nombre,
    code: teamCodes[sel.nombre] || sel.nombre.substring(0, 3).toUpperCase(),
    flag: getFlagUrl(sel.nombre),
    coach: {
      name: sel.cuerpo_tecnico.director_tecnico,
      photo: coachPhoto
    },
    squad: formattedPlayers
  });
});

fs.writeFileSync(outSquads, JSON.stringify(newSquads, null, 4), 'utf-8');

console.log("Updated matches.json and squads.json successfully.");
