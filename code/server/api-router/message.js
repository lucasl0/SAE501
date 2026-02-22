import express from "express";
import Message from "../../database/models/message.js";

const router = express.Router();

// GET /api/messages – liste paginée (pour l'admin)
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const per_page = parseInt(req.query.per_page) || 10;
        const skip = (page - 1) * per_page;

        const total = await Message.countDocuments();
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(per_page);

        res.json({
            data: messages,
            count: total,
            page,
            total_pages: Math.ceil(total / per_page),
            per_page,
        });
    } catch (error) {
        res.status(500).json({ errors: ["Erreur serveur"] });
    }
});

// GET /api/messages/:id – détail d’un message
router.get("/:id", async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ errors: ["Message introuvable"] });
        }
        res.json(message);
    } catch (error) {
        res.status(500).json({ errors: ["Erreur serveur"] });
    }
});

// POST /api/messages – réception du formulaire de contact
router.post("/", async (req, res) => {
    try {
        const { firstname, lastname, email, message, status } = req.body;

        // Validation simple
        if (!firstname || !lastname || !email || !message) {
            return res.status(400).json({
                errors: ["Tous les champs obligatoires doivent être remplis."],
            });
        }

        // Mapper le statut
        let identity = "non_precise";
        if (status === "student") identity = "etudiant";
        else if (status === "parent") identity = "parent";
        else if (status === "other") identity = "autre";

        const newMessage = new Message({
            firstname,
            lastname,
            email,
            content: message,
            identity,
        });

        await newMessage.save();

        res.status(201).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: ["Erreur serveur"] });
    }
});

export default router;