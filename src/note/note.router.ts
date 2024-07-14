import express from 'express';

import {authenticateJWT} from "../user/userMiddleware";
import {upload} from "./note.middleware";
import {createNote, deleteNote} from "./note.controller";




const noteRouter = express.Router();

noteRouter.post('/create-note', authenticateJWT, upload.fields([
    {name: 'coverImage', maxCount:1},
    {name: 'file', maxCount:1},
]), createNote);

noteRouter.delete('/:noteId', authenticateJWT, deleteNote);

export default noteRouter;