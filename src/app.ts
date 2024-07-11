/* The provided code is a TypeScript file that creates an Express application. Here is a breakdown of
what it does: */
/* eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";

const app = express();

// 𝗥𝗼𝘂𝘁𝗲𝘀
app.get("/", (req, res, next) => {
    res.json({
        name: "Sukriti",
        college: "Netaji Subhash Engineering College",
    });
});

export default app;
