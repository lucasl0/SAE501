import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import upload from "../uploader.js";
import { ressourceNameInApi } from "./utils.js";

const router = express.Router();

/**
 * LIST ARTICLES -> GET /articles
 * On récupère l'objet complet renvoyé par l'API :
 * { data, count, total_pages, page, query_params }
 */
router.get("/", async (req, res) => {
    let listErrors = [];
    let payload = {
        data: [],
        count: 0,
        total_pages: 1,
        page: 1,
        query_params: "",
    };

    try {
        const result = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.articles}`,
            { params: req.query } // ✅ garde sorting/page/per_page etc
        );
        payload = result.data || payload;
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Erreur serveur"];
    }

    res.render("pages/back-end/articles/list.njk", {
        list_articles: payload,          // ✅ objet paginé complet
        list_errors: listErrors,
        query_string_params: req.query,  // ✅ utilisé dans ton template (sorting)
    });
});

/**
 * ADD ARTICLE FORM -> GET /articles/add
 */
router.get("/add", async (req, res) => {
    let listAuthors = [];

    try {
        const result = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}`
        );
        listAuthors = result.data.data || [];
    } catch {}

    res.render("pages/back-end/articles/add-edit.njk", {
        article: {},
        list_authors: listAuthors,
        list_errors: [],
        is_edit: false,
    });
});

/**
 * EDIT ARTICLE FORM -> GET /articles/:id
 */
router.get("/:id", async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let article = {};
    let listErrors = [];
    let listAuthors = [];

    try {
        if (isEdit) {
            const result = await axios.get(
                `${res.locals.base_url}/api/${ressourceNameInApi.articles}/${req.params.id}`
            );
            article = result.data;
        }

        const authorsResult = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}`
        );
        listAuthors = authorsResult.data.data || [];
    } catch (e) {
        listErrors = e.response?.data?.errors || [];
    }

    res.render("pages/back-end/articles/add-edit.njk", {
        article,
        list_authors: listAuthors,
        list_errors: listErrors,
        is_edit: isEdit,
    });
});

/**
 * CREATE OR UPDATE ARTICLE -> POST /articles/add OR POST /articles/:id
 * ✅ Si erreurs => reste sur le form
 * ✅ Si succès (create ou edit) => redirect vers la liste
 */
router.post(["/add", "/:id"], upload.single("image"), async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);

    let options = {
        headers: { "Content-Type": "multipart/form-data" },
        data: { ...req.body, file: req.file },
    };

    let ressource = {};
    let listErrors = [];
    let listAuthors = [];

    if (isEdit) {
        options.method = "PUT";
        options.url = `${res.locals.base_url}/api/${ressourceNameInApi.articles}/${req.params.id}`;
    } else {
        options.method = "POST";
        options.url = `${res.locals.base_url}/api/${ressourceNameInApi.articles}`;
    }

    try {
        const result = await axios(options);
        ressource = result.data;

        const authorsResult = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}`
        );
        listAuthors = authorsResult.data.data || [];
    } catch (e) {
        listErrors = e.response?.data?.errors || [];
        ressource = e.response?.data?.ressource || {};

        // recharge auteurs au cas où on re-render
        try {
            const authorsResult = await axios.get(
                `${res.locals.base_url}/api/${ressourceNameInApi.authors}`
            );
            listAuthors = authorsResult.data.data || [];
        } catch {}
    } finally {
        if (listErrors.length) {
            return res.render("pages/back-end/articles/add-edit.njk", {
                article: ressource,
                list_authors: listAuthors,
                list_errors: listErrors,
                is_edit: isEdit,
            });
        }

        return res.redirect(`${res.locals.admin_url}/articles`);
    }
});

export default router;
