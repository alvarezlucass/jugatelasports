import fetch from 'node-fetch';

async function run() {
    const res = await fetch('https://llqhnyccpohvuqemgxrt.supabase.co/rest/v1/matches?select=id,home_team,away_team,status,start_time', {
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscWhueWNjcG9odnVxZW1neHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDU3OTYsImV4cCI6MjA4NjEyMTc5Nn0.AOF9MS8f0ZH1sXkd2AOdNdJRdpaT73XFE7A9iNy8LiA',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscWhueWNjcG9odnVxZW1neHJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1NDU3OTYsImV4cCI6MjA4NjEyMTc5Nn0.AOF9MS8f0ZH1sXkd2AOdNdJRdpaT73XFE7A9iNy8LiA'
        }
    });
    const data = await res.json();
    console.log("All matches containing Méx:", data.filter(m => m.home_team.includes('Méx') || m.away_team.includes('Méx')));
}

run();
