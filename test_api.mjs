import fetch from 'node-fetch';

async function run() {
    const res = await fetch('https://v3.football.api-sports.io/fixtures?id=718243', {
        headers: {
            'x-apisports-key': '1a15fdebb7c077337316421ed9239380',
            'x-rapidapi-host': 'v3.football.api-sports.io'
        }
    });
    const data = await res.json();
    console.log(JSON.stringify(data.response[0], null, 2).substring(0, 1000));
}

run();
