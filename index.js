const express = require("express")
const app = express();
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
const mutler = require("multer");

// parse application/json
app.use(bodyParser.json());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// app.use(express.urlencoded());
app.use(mutler().array(""));


const initBrowser = puppeteer.launch({
    executablePath: process.env.CHROME_BIN || null,
    defaultViewport: null,
    headless: true,
});

async function addRequestFilter(page) {

    const resourcetypes = ['document'];

    await page.setRequestInterception(true);
    // page.
    page.on("request", (request) => {
        // return request.continue();
        if (resourcetypes.includes(request.resourceType())) {
            request.continue();
        }
        else {
            request.abort();
        }
    });

    return page;
}

const getData = async (url) => {

    // Open a new page
    const browser = await initBrowser;
    var page = await browser.newPage();
    page = await addRequestFilter(page);

    await page.goto(url, {
        // waitUntil: "domcontentloaded",
    });
    // trigger
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
    return {
        title: title,
        price: price,
        image: image,
    };
};

const getHTML = async (url, headers = null) => {

    const browser = await initBrowser;
    var page = await browser.newPage();
    page = await addRequestFilter(page);
    if (headers) {
        // console.log("headers",headers);
        await page.setExtraHTTPHeaders(headers);
    }

    await page.goto(url, {
        // waitUntil: "domcontentloaded",
    });

    return await page.content();

}
const getScreenshot = async (url, headers = null) => {

    const browser = await initBrowser;
    var page = await browser.newPage();
    page = await addRequestFilter(page);

    if (headers) {
        // console.log("headers",headers);
        await page.setExtraHTTPHeaders(headers);
    }
    
    await page.goto(url, {
        waitUntil: "domcontentloaded",
    });

    const image = await page.screenshot({
        type: "png",
    });

    const html = await page.content();

    page.close();
    return { image, html };

}

app.get("/", async (req, res) => {
    res.send('go to /test');
})

url = "https://www.flipkart.com/apple-iphone-15-blue-128-gb/p/itmbf14ef54f645d";


app.get("/test", async (req, res) => {
    const data = await getData(url);
    res.type("json");
    res.send(JSON.stringify(data));
})

app.get("/testhtml", async (req, res) => {
    const html = await getHTML(url);
    res.type("json");
    res.send(JSON.stringify({
        html: html
    }));
})
app.get("/testscreenshot", async (req, res) => {
    const {html,image} = await getScreenshot(url);
    // convert buffer to base64 string
    const base64Image = await image.toString('base64');

    res.type("json");
    return res.send(JSON.stringify({
        // "html":html,
        "screenshot": base64Image
    }));
})
app.post("/html", async (req, res) => {
    const data = req.body;
    if (!("url" in data)) {
        res.type("json");
        return res.send(JSON.stringify({
            "error": "no url parameter in request",
        }));
    }
    const { url, headers } = data;

    try {
        const html = await getHTML(url, headers);
        res.type("json").send(JSON.stringify({
            html: html
        }));
    }
    catch (e) {
        return res.type("json").send(JSON.stringify({
            "error": "can't open page",
        }));
    }
})
app.post("/screenshot", async (req, res) => {
    const data = req.body;
    if (!("url" in data)) {
        return res.type("json").send(JSON.stringify({
            "error": "no url parameter in request",
        }));
    }
    const url = data['url'];

    try {
        const { image, html } = await getScreenshot(url);
        // convert buffer to base64 string
        const base64Image = await image.toString('base64');

        return res.type("json").send(JSON.stringify({
            "base64": base64Image,
            "html":html,
        }));
    }
    catch (e) {
        return res.type("json").send(JSON.stringify({
            "error": "can't open page",
        }));
    }
})

app.listen(8080, () => console.log("Server running at port 8080"));