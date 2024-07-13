import { Book } from './book.types';
/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose, { Mongoose } from "mongoose";

const BookSchema = new mongoose.Schema<Book>({
    title: {
        type: String,
        required: true,
    },
    author: {
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
    }
}, {timestamps: true});

export default mongoose.model<Book>('Book', BookSchema);