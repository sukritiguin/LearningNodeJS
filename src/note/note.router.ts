import express from 'express';

import {authenticateJWT} from "../user/userMiddleware";
import {upload} from "./note.middleware";
import {createNote} from "./note.controller";




const noteRouter = express.Router();

noteRouter.post('/create-note', authenticateJWT, upload.fields([
    {name: 'coverImage', maxCount:1},
    {name: 'file', maxCount:1},
]), createNote);

export default noteRouter;