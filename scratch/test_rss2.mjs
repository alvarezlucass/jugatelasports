async function testRSS() {
    try {
        const response = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://e00-marca.uecdn.es/rss/futbol/internacional.xml');
        const data = await response.json();
        console.log(data.items.slice(0, 3));
    } catch (e) {
        console.error(e);
    }
}
testRSS();
