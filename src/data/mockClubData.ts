export const mockClubData = {
  team: {
    id: 484,
    name: "Nueva Chicago",
    logo: "https://media.api-sports.io/football/teams/484.png",
    founded: 1911,
    city: "Buenos Aires",
    national: false
  },
  venue: {
    name: "Estadio República de Mataderos",
    capacity: 28500,
    surface: "grass",
    image: "https://media.api-sports.io/football/venues/491.png"
  },
  coach: {
    name: "A. Montenegro",
    age: 46,
    nationality: "Argentina",
    photo: "https://media.api-sports.io/football/coachs/1722.png",
    preferredFormation: "4-4-2"
  },
  fixtures: [
    { result: 'W', opponent: "Almirante Brown", opponentLogo: "https://media.api-sports.io/football/teams/492.png", score: "1-0", date: "15 May 2026", home: true },
    { result: 'D', opponent: "Dep. Morón", opponentLogo: "https://media.api-sports.io/football/teams/488.png", score: "1-1", date: "08 May 2026", home: false },
    { result: 'L', opponent: "San Martín (T)", opponentLogo: "https://media.api-sports.io/football/teams/481.png", score: "0-2", date: "01 May 2026", home: false },
    { result: 'W', opponent: "Atlanta", opponentLogo: "https://media.api-sports.io/football/teams/490.png", score: "2-1", date: "24 Apr 2026", home: true },
    { result: 'D', opponent: "Chacarita", opponentLogo: "https://media.api-sports.io/football/teams/485.png", score: "0-0", date: "17 Apr 2026", home: false },
  ],
  stats: {
    played: 16,
    wins: 5,
    draws: 6,
    losses: 5,
    goalsFor: 15,
    goalsAgainst: 16,
    cleanSheets: 7,
    failedToScore: 7,
    biggestWin: {
        score: "3-1",
        opponent: "Defensores de Belgrano",
        opponentLogo: "https://media.api-sports.io/football/teams/486.png",
        date: "10 Mar 2026",
        home: true,
        scorers: ["F. Castro 15'", "G. Vega 44'", "A. Ruiz 89'"]
    },
    biggestLoss: {
        score: "0-4",
        opponent: "San Martín (SJ)",
        opponentLogo: "https://media.api-sports.io/football/teams/482.png",
        date: "28 Feb 2026",
        home: false,
        scorers: ["M. Gimenez 10'", "P. Ruiz 33'", "A. Molina 65'", "A. Molina 80'"]
    }
  },
  advancedStats: {
    averagePossession: "54%",
    expectedGoals: "1.42",
    actualGoals: "0.94",
    goalsPrevented: "0.15",
    passesTotal: 450,
    passesAccuracy: "78%",
    shotsOnTarget: 4.2,
    shotsOffTarget: 5.1
  },
  goalsByMinute: [
    { minute: "0-15", for: 0, against: 0 },
    { minute: "16-30", for: 2, against: 4 },
    { minute: "31-45", for: 2, against: 7 },
    { minute: "46-60", for: 3, against: 0 },
    { minute: "61-75", for: 3, against: 2 },
    { minute: "76-90", for: 5, against: 3 }
  ],
  cardsByMinute: [
    { minute: "0-15", yellow: 1, red: 0 },
    { minute: "16-30", yellow: 5, red: 0 },
    { minute: "31-45", yellow: 2, red: 1 },
    { minute: "46-60", yellow: 6, red: 0 },
    { minute: "61-75", yellow: 13, red: 0 },
    { minute: "76-90", yellow: 10, red: 0 },
    { minute: "90+", yellow: 6, red: 1 }
  ],
  overUnder: [
    { label: "Over 0.5", value: 14, fill: "#3b82f6" },
    { label: "Under 0.5", value: 2, fill: "#1e3a8a" },
    { label: "Over 1.5", value: 10, fill: "#8b5cf6" },
    { label: "Under 1.5", value: 6, fill: "#4c1d95" },
    { label: "Over 2.5", value: 4, fill: "#10b981" },
    { label: "Under 2.5", value: 12, fill: "#064e3b" },
  ],
  squad: [
    // We add deep data to G. Vega as an example of a "Star Player"
    { 
      id: 323784, 
      name: "G. Vega", 
      age: 23, 
      number: 10, 
      position: "Midfielder", 
      rating: 7.5, 
      matches: 16, 
      photo: "https://media.api-sports.io/football/players/323784.png",
      deepStats: {
        minutes: 1240,
        lineups: 14,
        substitutesIn: 2,
        substitutesOut: 4,
        goals: 3,
        assists: 5,
        yellowCards: 2,
        redCards: 0,
        radar: [
            { subject: 'Ataque', A: 80, fullMark: 100 },
            { subject: 'Defensa', A: 45, fullMark: 100 },
            { subject: 'Pases', A: 85, fullMark: 100 },
            { subject: 'Físico', A: 70, fullMark: 100 },
            { subject: 'Táctica', A: 75, fullMark: 100 },
            { subject: 'Duelos', A: 60, fullMark: 100 },
        ],
        transfers: [
            { date: "2026-01-04", type: "Loan", from: "Boca Juniors", to: "Nueva Chicago", fromLogo: "https://media.api-sports.io/football/teams/451.png" },
            { date: "2025-12-30", type: "Return", from: "Banfield", to: "Boca Juniors", fromLogo: "https://media.api-sports.io/football/teams/449.png" },
            { date: "2025-01-03", type: "Loan", from: "Boca Juniors", to: "Banfield", fromLogo: "https://media.api-sports.io/football/teams/451.png" },
            { date: "2024-01-01", type: "Loan", from: "Boca Juniors", to: "Atlanta", fromLogo: "https://media.api-sports.io/football/teams/451.png" },
            { date: "2022-06-25", type: "Loan", from: "Boca Juniors", to: "Godoy Cruz", fromLogo: "https://media.api-sports.io/football/teams/451.png" }
        ]
      }
    },
    // We keep the rest simple but they will still be clickable
    { id: 1, name: "F. Ferrero", age: 33, number: 1, position: "Goalkeeper", rating: 7.2, matches: 16, photo: "https://media.api-sports.io/football/players/24430.png" },
    { id: 2, name: "J. Carranza", age: 21, number: 12, position: "Goalkeeper", rating: 6.5, matches: 0, photo: "https://media.api-sports.io/football/players/145880.png" },
    { id: 3, name: "T. Rossi", age: 24, number: 2, position: "Defender", rating: 6.8, matches: 15, photo: "https://media.api-sports.io/football/players/145885.png" },
    { id: 4, name: "D. Arroyo", age: 29, number: 3, position: "Defender", rating: 6.9, matches: 16, photo: "https://media.api-sports.io/football/players/112678.png" },
    { id: 5, name: "S. Callegari", age: 26, number: 4, position: "Defender", rating: 7.0, matches: 14, photo: "https://media.api-sports.io/football/players/145882.png" },
    { id: 6, name: "J. Tomasini", age: 22, number: 6, position: "Defender", rating: 6.7, matches: 8, photo: "https://media.api-sports.io/football/players/145883.png" },
    { id: 7, name: "L. Vesco", age: 31, number: 13, position: "Defender", rating: 6.6, matches: 5, photo: "https://media.api-sports.io/football/players/145884.png" },
    { id: 8, name: "I. Lorenzo", age: 20, number: 14, position: "Defender", rating: 6.4, matches: 2, photo: "https://media.api-sports.io/football/players/145886.png" },
    { id: 10, name: "A. Ruiz", age: 32, number: 8, position: "Midfielder", rating: 7.3, matches: 16, photo: "https://media.api-sports.io/football/players/6288.png" },
    { id: 11, name: "E. Martinez", age: 25, number: 5, position: "Midfielder", rating: 6.8, matches: 12, photo: "https://media.api-sports.io/football/players/145887.png" },
    { id: 12, name: "M. Fernandez", age: 21, number: 11, position: "Midfielder", rating: 6.9, matches: 10, photo: "https://media.api-sports.io/football/players/145888.png" },
    { id: 13, name: "N. Petrecca", age: 19, number: 15, position: "Midfielder", rating: 6.5, matches: 4, photo: "https://media.api-sports.io/football/players/566547.png" },
    { id: 14, name: "R. Ramirez", age: 25, number: 16, position: "Midfielder", rating: 6.7, matches: 6, photo: "https://media.api-sports.io/football/players/566214.png" },
    { id: 15, name: "F. Castro", age: 22, number: 9, position: "Attacker", rating: 7.8, matches: 15, photo: "https://media.api-sports.io/football/players/375580.png" },
    { id: 16, name: "L. Ambrogio", age: 26, number: 7, position: "Attacker", rating: 7.1, matches: 14, photo: "https://media.api-sports.io/football/players/128568.png" },
    { id: 17, name: "E. Cardozo", age: 24, number: 17, position: "Attacker", rating: 6.9, matches: 9, photo: "https://media.api-sports.io/football/players/5922.png" },
    { id: 18, name: "S. Cocimano", age: 25, number: 18, position: "Attacker", rating: 6.6, matches: 5, photo: "https://media.api-sports.io/football/players/199079.png" },
    { id: 19, name: "T. Ocampo", age: 17, number: 19, position: "Attacker", rating: 6.4, matches: 1, photo: "https://media.api-sports.io/football/players/566572.png" },
    { id: 20, name: "M. Bergara", age: 22, number: 20, position: "Attacker", rating: 6.8, matches: 7, photo: "https://media.api-sports.io/football/players/393104.png" }
  ]
};
