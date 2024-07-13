import { User } from './../user/userTypes';
export interface Book{
    _id: string;
    title: string;
    author: User;
    genre: string;
    coverImage: string; // Cloudinary cover image url
    file: string; // Cloudinary file url
    createdAt: Date;
    updatedAt: Date;
}