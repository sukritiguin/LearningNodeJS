import mongoose from "mongoose";
import { User } from "./userTypes";

const userSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    password: {
        type: String,
        required: true,
    }
}, {timestamps: true})


export default mongoose.model<User>('User', userSchema)
// Model name will be "users" : lowercase and prural form