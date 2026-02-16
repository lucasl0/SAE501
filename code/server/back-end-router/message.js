import express from "express";
import axios from "axios";
import { ressourceNameInApi } from "./utils.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const queryParams = new URLSearchParams({ per_page: 10, ...req.query }).toString();

    let apiResult = { data: [], count: 0, total_pages: 1, page: 1, query_params: "" };
    let listErrors = [];

    try {
        const r = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.messages}?${queryParams}`);
        apiResult = r.data;
    } catch (e) {
        listErrors = e.response?.data?.errors || ["Erreur serveur"];
    }

    res.render("pages/back-end/messages/list.njk", {
        list_messages: apiResult,
        list_errors: listErrors,
    });
});

export default router;
