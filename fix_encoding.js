const fs = require('fs');
let content = fs.readFileSync('src/data/worldCupPersistence.ts', 'utf8');

content = content.replace(/teamName === ['\"].*?xico['\"]/g, "teamName === 'México'");
content = content.replace(/homeTeam: ['\"].*?xico['\"]/g, "homeTeam: 'México'");
content = content.replace(/awayTeam: ['\"].*?xico['\"]/g, "awayTeam: 'México'");
content = content.replace(/['\"]M.*?xico['\"]/g, "'México'");

content = content.replace(/homeTeam: ['\"].*?frica['\"]/g, "homeTeam: 'Sudáfrica'");
content = content.replace(/awayTeam: ['\"].*?frica['\"]/g, "awayTeam: 'Sudáfrica'");
content = content.replace(/['\"]Sud.*?frica['\"]/g, "'Sudáfrica'");

content = content.replace(/homeTeam: ['\"].*?Checa['\"]/g, "homeTeam: 'República Checa'");
content = content.replace(/awayTeam: ['\"].*?Checa['\"]/g, "awayTeam: 'República Checa'");
content = content.replace(/['\"]Rep.*?Checa['\"]/g, "'República Checa'");

content = content.replace(/homeTeam: ['\"]Can.*?d.*?['\"]/g, "homeTeam: 'Canadá'");
content = content.replace(/awayTeam: ['\"]Can.*?d.*?['\"]/g, "awayTeam: 'Canadá'");
content = content.replace(/['\"]Can.*?d.*?['\"]/g, "'Canadá'");

content = content.replace(/homeTeam: ['\"]Hait.*?['\"]/g, "homeTeam: 'Haití'");
content = content.replace(/awayTeam: ['\"]Hait.*?['\"]/g, "awayTeam: 'Haití'");
content = content.replace(/['\"]Hait.*?['\"]/g, "'Haití'");

content = content.replace(/['\"]Espa.*?a['\"]/g, "'España'");
content = content.replace(/['\"]A.*?frica['\"]/g, "'África'");

fs.writeFileSync('src/data/worldCupPersistence.ts', content, 'utf8');
console.log("Done");
