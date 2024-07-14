import { Note } from "./note.types";
/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Mongoose } from "mongoose";

const NoteSchema = new mongoose.Schema<Note>(
    {
        title: {
            type: String,
            required: true,
        },
        contributor: {
            type: mongoose.Schema.ObjectId,
            required: true,
        },
        coverImage: {
            type: String,
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
        genre: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<Note>("Note", NoteSchema);
