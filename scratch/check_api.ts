import dotenv from 'dotenv';
dotenv.config();

const API_FOOTBALL_KEY = process.env.VITE_API_FOOTBALL_KEY;

async function check() {
    console.log("Fetching 1489380...");
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=1489380`, {
        headers: { 'x-apisports-key': API_FOOTBALL_KEY }
    });
    const data = await res.json();
    console.log(JSON.stringify(data.response[0], null, 2));
}

check();
