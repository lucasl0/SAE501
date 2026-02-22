import express from "express";
import axios from "axios";
import routeName from "#server/utils/name-route.middleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| LISTE DES MESSAGES (ADMIN)
|--------------------------------------------------------------------------
*/
router.get("/", routeName("admin_messages"), async (req, res) => {
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
        });

    } catch (error) {
        console.error("Erreur récupération messages :", error.message);

        return res.render("pages/back-end/messages/list.njk", {
            list_messages: { data: [], count: 0 },
            list_errors: ["Impossible de récupérer les messages"],
        });
    }
});


/*
|--------------------------------------------------------------------------
| DETAIL D’UN MESSAGE (ADMIN)
|--------------------------------------------------------------------------
*/
router.get("/:id", routeName("admin_message_detail"), async (req, res) => {
    try {
        const apiRes = await axios.get(
            `${res.locals.base_url}/api/messages/${req.params.id}`
        );

        return res.render("pages/back-end/messages/detail.njk", {
            message: apiRes.data,
        });
    } catch {
        return res.status(404).render("pages/errors/404.njk");
    }
});
export default router;
