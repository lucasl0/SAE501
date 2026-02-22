import express from "express";
import axios from "axios";
import routeName from "#server/utils/name-route.middleware.js";
import { ressourceNameInApi } from "./utils.js"; // si tu l’utilises déjà

const router = express.Router();
const base = "messages";

// LIST
router.get(`/${base}`, routeName("admin_messages"), async (req, res) => {
    const queryParams = new URLSearchParams({ per_page: 10, ...req.query }).toString();

    let result = {};
    let listErrors = [];

    try {
        result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.messages}?${queryParams}`);
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Erreur serveur"];
    }

    return res.render("pages/back-end/messages/list.njk", {
        list_messages: result.data ?? { data: [], count: 0, total_pages: 1, page: 1, query_params: "" },
        list_errors: listErrors,
    });
});

// DETAIL
router.get(`/${base}/:id`, routeName("admin_message_detail"), async (req, res) => {
    let result = {};
    let errors = [];

    try {
        result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.messages}/${req.params.id}`);
    } catch (error) {
        errors = error.response?.data?.errors || ["Message introuvable"];
    }

    if (errors.length) {
        return res.status(404).render("pages/errors/404.njk"); // adapte à ton projet
    }

    return res.render("pages/back-end/messages/detail.njk", {
        message: result.data,
    });
});

export default router;