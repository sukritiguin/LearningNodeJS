/* This code snippet is a TypeScript configuration file used to securely store environment variables.
It imports the `config` function from the `dotenv` package, which is used to load environment
variables from a `.env` file. The `conf()` function is then called to load the environment
variables. */

import { config as conf } from "dotenv";

conf()

const _config = {
    port: process.env.PORT,
    databaseURL: process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    saltOrRounds: process.env.SALT_OR_ROUNDS || '10',
    jwtSecret: process.env.JWT_SECRET,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASS,
};

export const config = Object.freeze(_config);
