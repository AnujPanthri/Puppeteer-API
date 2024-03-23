const express = require("express")
const app = express();
const puppeteer = require("puppeteer");


const getData = async () => {
    // Start a Puppeteer session with:
    // - a visible browser (`headless: false` - easier to debug because you'll see the browser in action)
    // - no default viewport (`defaultViewport: null` - website page will in full width and height)
    const browser = await puppeteer.launch({
        executablePath: process.env.CHROME_BIN || null,
        defaultViewport: null,
        headless: true,
    });

    console.log("Scrapping started");
    // Open a new page
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        // return request.continue();
        if(request.resourceType() == 'document'){
            request.continue();
        }
        else{
            request.abort();
        }
    });

    
    url = "https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf14ef54f645d";
    await page.goto(url, {
        // waitUntil: "domcontentloaded",
    });
    // console.log(await page.content());

    const title = await page.evaluate(() => {
        const elem = document.querySelector("span.B_NuCI");
        if (elem)
            return elem.textContent;
    });
    const price = await page.evaluate(() => {
        const elem = document.querySelector("div._30jeq3._16Jk6d");
        if (elem)
            return elem.textContent;
    });


    const image = await page.evaluate(() => {
        const elem = document.querySelector("div.CXW8mj._3nMexc>img");
        if (elem)
            return elem.src;
    });


    page.close();
    return { title, price, image };
};

app.get("/", async (req, res) => {
    res.send('go to /test');
})

app.get("/test", async (req, res) => {
    const data = await getData();
    res.type("json");
    res.send(JSON.stringify(data));
})

app.listen(8080, () => console.log("Server running at port 8080"));