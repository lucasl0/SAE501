import mongoose, { Schema } from "mongoose";
import isEmail from "validator/lib/isEmail.js";

const messageSchema = new Schema(
    {
        lastname: { type: String, required: true, trim: true },
        firstname: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            trim: true,
            validate: {
                validator: isEmail,
                message: "Veuillez mettre un email valide.",
            },
        },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        identity: {
            type: String,
            enum: ["non_precise", "etudiant", "autre", "parent"],
            default: "non_precise",
        },
        is_read: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export default mongoose.model("Message", messageSchema);
