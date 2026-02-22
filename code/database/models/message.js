import mongoose, { Schema } from "mongoose";
import isEmail from "validator/lib/isEmail";

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
            maxlength: [200, 'Le champ "contenu" ne peut pas dépasser 200 caractères'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Le champ "email" est requis'],
            validate: [isEmail, "Veuillez mettre un email valide."],
            trim: true,
        },
        identity: {
            type: String,
            enum: ["non_precise", "etudiant", "autre", "parent"],
            default: "non_precise",
        },
    },
    {
        timestamps: true, // => createdAt / updatedAt
    }
);

export default mongoose.model("Message", messageSchema);