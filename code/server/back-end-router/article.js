import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import upload from "../uploader.js";
import { ressourceNameInApi } from "./utils.js";

const router = express.Router();

/**
 * LIST ARTICLES
 * GET /admin/articles
 */
router.get("/", async (req, res) => {
    const queryParams = new URLSearchParams({ per_page: 7, ...req.query }).toString();

    let apiResult = { data: [], count: 0, total_pages: 1, page: 1, query_params: "" };
    let listErrors = [];

    try {
        const result = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.articles}?${queryParams}`
        );
        apiResult = result.data; // { data: [...], count, total_pages, ... }
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Erreur serveur"];
    }

    res.render("pages/back-end/articles/list.njk", {
        list_articles: apiResult, // ✅ comme ton template articles
        list_errors: listErrors,
        query_string_params: req.query,
    });
});

/**
 * ADD ARTICLE FORM
 * GET /admin/articles/add
 */
router.get("/add", async (req, res) => {
    let listAuthors = [];
    let listErrors = [];

    try {
        const authorsRes = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}?per_page=200`
        );
        listAuthors = authorsRes.data.data || [];
    } catch (e) {
        listErrors = e.response?.data?.errors || [];
    }

    res.render("pages/back-end/articles/add-edit.njk", {
        article: {},
        list_authors: listAuthors,
        list_errors: listErrors,
        is_edit: false,
    });
});

/**
 * EDIT ARTICLE FORM
 * GET /admin/articles/:id
 */
router.get("/:id", async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isEdit) {
        return res.redirect(`${res.locals.admin_url}/articles`);
    }

    let article = {};
    let listAuthors = [];
    let listErrors = [];

    try {
        const [articleRes, authorsRes] = await Promise.all([
            axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.articles}/${req.params.id}`),
            axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.authors}?per_page=200`),
        ]);

        article = articleRes.data;
        listAuthors = authorsRes.data.data || [];
    } catch (e) {
        listErrors = e.response?.data?.errors || ["Erreur serveur"];
    }

    res.render("pages/back-end/articles/add-edit.njk", {
        article,
        list_authors: listAuthors,
        list_errors: listErrors,
        is_edit: true,
    });
});

/**
 * CREATE ARTICLE
 * POST /admin/articles/add
 */
router.post("/add", upload.single("image"), async (req, res) => {
    let ressource = {};
    let listErrors = [];
    let listAuthors = [];

    const options = {
        method: "POST",
        url: `${res.locals.base_url}/api/${ressourceNameInApi.articles}`,
        headers: { "Content-Type": "multipart/form-data" },
        data: { ...req.body, file: req.file },
    };

    try {
        const result = await axios(options);
        ressource = result.data;
    } catch (e) {
        listErrors = e.response?.data?.errors || ["Erreur serveur"];
        ressource = e.response?.data?.ressource || { ...req.body };
    }

    // Recharger les auteurs si on doit ré-afficher le form (erreurs)
    if (listErrors.length) {
        try {
            const authorsRes = await axios.get(
                `${res.locals.base_url}/api/${ressourceNameInApi.authors}?per_page=200`
            );
            listAuthors = authorsRes.data.data || [];
        } catch {}

        return res.render("pages/back-end/articles/add-edit.njk", {
            article: ressource,
            list_authors: listAuthors,
            list_errors: listErrors,
            is_edit: false,
        });
    }

    return res.redirect(`${res.locals.admin_url}/articles`);
});

/**
 * UPDATE ARTICLE
 * POST /admin/articles/:id
 */
router.post("/:id", upload.single("image"), async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    if (!isEdit) {
        return res.redirect(`${res.locals.admin_url}/articles`);
    }

    let ressource = {};
    let listErrors = [];
    let listAuthors = [];

    const options = {
        method: "PUT",
        url: `${res.locals.base_url}/api/${ressourceNameInApi.articles}/${req.params.id}`,
        headers: { "Content-Type": "multipart/form-data" },
        data: { ...req.body, file: req.file },
    };

    try {
        const result = await axios(options);
        ressource = result.data;
    } catch (e) {
        listErrors = e.response?.data?.errors || ["Erreur serveur"];
        ressource = e.response?.data?.ressource || { ...req.body, _id: req.params.id };
    }

    // Recharger auteurs si on doit ré-afficher le form
    if (listErrors.length) {
        try {
            const authorsRes = await axios.get(
                `${res.locals.base_url}/api/${ressourceNameInApi.authors}?per_page=200`
            );
            listAuthors = authorsRes.data.data || [];
        } catch {}

        return res.render("pages/back-end/articles/add-edit.njk", {
            article: ressource,
            list_authors: listAuthors,
            list_errors: listErrors,
            is_edit: true,
        });
    }

    return res.redirect(`${res.locals.admin_url}/articles`);
});

export default router;
