import express from "express";
import axios from "axios";

const router = express.Router();

// Liste des messages
router.get("/", async (req, res) => {
    const queryParams = new URLSearchParams({
        per_page: 10,
        ...req.query,
    }).toString();

    try {
        const apiRes = await axios.get(
            `${res.locals.base_url}/api/messages?${queryParams}`
        );

        return res.render("pages/back-end/messages/list.njk", {
            list_messages: apiRes.data,
            admin_url: "/admin",
        });
    } catch (error) {
        console.error("Erreur récupération messages :", error.message);
        return res.render("pages/back-end/messages/list.njk", {
            list_messages: { data: [], count: 0 },
            list_errors: ["Impossible de récupérer les messages"],
            admin_url: "/admin",
        });
    }
});

// Détail d’un message
router.get("/:id", async (req, res) => {
    try {
        const apiRes = await axios.get(
            `${res.locals.base_url}/api/messages/${req.params.id}`
        );

        return res.render("pages/back-end/messages/detail.njk", {
            message: apiRes.data,
            admin_url: "/admin",
        });
    } catch {
        return res.status(404).render("pages/errors/404.njk");
    }
});

export default router;