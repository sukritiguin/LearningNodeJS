// eslint-disable @typescript-eslint/no-unused-vars */
import express from "express";
import {createBook} from "./book.controller";
import {upload} from "./book.middleware";
import {authenticateJWT} from "../user/userMiddleware";


const bookRouter = express.Router();

bookRouter.post('/create-book', authenticateJWT, upload.fields([
    {name: 'coverImage', maxCount:1},
    {name: 'file', maxCount:1},
]), createBook)

export default bookRouter;
