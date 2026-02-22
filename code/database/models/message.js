import mongoose, { Schema } from "mongoose";
import isEmail from "validator/lib/isEmail.js";

const messageSchema = new Schema(
    {
        lastname: {
            type: String,
            required: [true, 'Le champ "nom" est requis'],
            trim: true,
        },
        firstname: {
            type: String,
            required: [true, 'Le champ "prénom" est requis'],
            trim: true,
        },
        content: {
            type: String,
            required: [true, 'Le champ "message" est requis'],
            maxlength: [2000, "Le message ne peut pas dépasser 2000 caractères"], // adaptez
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Le champ "email" est requis'],
            validate: [isEmail, "Veuillez fournir un email valide."],
            trim: true,
            lowercase: true,
        },
        identity: {
            type: String,
            enum: ["non_precise", "etudiant", "autre", "parent"],
            default: "non_precise",
        },
    },
    {
        timestamps: true, // ajoute createdAt et updatedAt
    }
);

export default mongoose.model("Message", messageSchema);