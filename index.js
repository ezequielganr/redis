const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rtime = require("response-time");
const axios = require("axios");
const redis = require("redis");
const erlimit = require("express-rate-limit");

const port = 8000;

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));

app.use(express.json());
app.use(helmet());
app.use(morgan("combined"));
app.use(rtime());

const limit = erlimit({
    windowMs: 1 * 60 * 1000,
    max: 5
});

app.use(limit);

const client = redis.createClient({
    host: "localhost",
    port: 6379
});

app.get("/", limit, async (req, res) => {
    try {
        await client.connect();

        let reply = await client.get("users");
    
        if (reply) {
            await client.disconnect();

            return res.json(JSON.parse(reply));
        }
    
        let response = await axios.get("https://jsonplaceholder.typicode.com/users");
    
        await client.set("users", JSON.stringify(response.data), {
            EX: 100,
            NX: true
        });

        await client.disconnect();

        res.json(response.data);

    } catch (e) {
        console.log(e);
    }
});

app.listen(port);
