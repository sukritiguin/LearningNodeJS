/* This code snippet is a TypeScript configuration file used to securely store environment variables.
It imports the `config` function from the `dotenv` package, which is used to load environment
variables from a `.env` file. The `conf()` function is then called to load the environment
variables. */

import { config as conf } from "dotenv";

conf()

const _config = {
    port: process.env.PORT,
    databaseURL: process.env.MONGO_CONNECTION_STRING,
};

export const config = Object.freeze(_config);
