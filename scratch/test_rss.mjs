async function testRSS() {
    try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://www.espn.com/espn/rss/soccer/news');
        const data = await response.json();
        console.log(data.items.slice(0, 3));
    } catch (e) {
        console.error(e);
    }
}
testRSS();
