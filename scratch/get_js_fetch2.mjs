async function run() {
    const res = await fetch('https://jugatelasports.com');
    const text = await res.text();
    const match = text.match(/src="(\/assets\/index-[^\"]+\.js)"/);
    if (match) {
        console.log("Found JS file:", match[1]);
        const jsRes = await fetch('https://jugatelasports.com' + match[1]);
        const jsText = await jsRes.text();
        if (jsText.includes('ai_prediction')) {
            console.log("CONTAINS ai_prediction!");
        } else {
            console.log("DOES NOT CONTAIN ai_prediction!");
        }
    }
}
run();
