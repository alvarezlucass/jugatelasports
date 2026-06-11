const http = require('https');
http.get('https://jugatelasports.com', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const match = data.match(/src="(\/assets\/index-[^\"]+\.js)"/);
        if (match) {
            console.log("Found JS file:", match[1]);
        } else {
            console.log("JS file not found.");
        }
    });
});
