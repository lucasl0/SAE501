import mongoose, { Schema } from "mongoose";
import isEmail from "validator/lib/isEmail";

const errorRequiredMessage = "Ce champ est obligatoire";

const messageSchema = new Schema({
    lastname: {
        type: String,
        required: [true, errorRequiredMessage],
        trim: true,
    },

    firstname: {
        type: String,
        required: [true, errorRequiredMessage],
        trim: true,
    },

    content: {
        type: String,
        maxlength: [
            200,
            "Le champ \"contenu\" ne peut pas dépasser 200 caractères",
        ],
        trim: true,
    },

    email: {
        type: String,
        required: [true, errorRequiredMessage],
        validate: {
            validator: isEmail,
            message: "Veuillez mettre un email valide.",
        },
        trim: true,
    },

    identity: {
        type: String,
        enum: ["non_precise", "etudiant", "autre", "parent"],
        default: "non_precise",
    },
});

export default mongoose.model("Message", messageSchema);
