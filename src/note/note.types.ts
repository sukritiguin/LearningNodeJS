import { User } from "./../user/userTypes";
export interface Note {
    _id: string;
    title: string;
    contributor: User;
    genre: string;
    coverImage: string; // Cloudinary cover image url
    file: string; // Cloudinary file url
    createdAt: Date;
    updatedAt: Date;
}
