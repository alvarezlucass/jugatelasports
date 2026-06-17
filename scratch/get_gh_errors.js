const https = require('https');

https.get('https://api.github.com/repos/alvarezlucass/jugatelasports/actions/runs', {
    headers: { 'User-Agent': 'node.js' }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (!parsed.workflow_runs) {
                console.log('No runs found or API limit hit');
                return;
            }
            const runs = parsed.workflow_runs.slice(0, 5);
            runs.forEach(run => {
                console.log(`[${run.name}] Status: ${run.status}, Conclusion: ${run.conclusion}, Updated at: ${run.updated_at}, URL: ${run.html_url}`);
            });
        } catch (e) {
            console.error('Error parsing JSON');
        }
    });
}).on('error', err => console.error(err));
