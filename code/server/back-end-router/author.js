import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import upload from "#server/uploader.js";
import { ressourceNameInApi } from "./utils.js";

const base = "auteurs";
const router = express.Router();

/**
 * LIST AUTHORS
 * GET /back-end/auteurs
 */
router.get("/", async (req, res) => {
    const queryParams = new URLSearchParams({ per_page: 50, ...req.query }).toString();
    let apiResult = {
        data: [],
        count: 0,
        total_pages: 1,
        page: 1,
        query_params: "",
    };
    let listErrors = [];

    try {
        const response = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}?${queryParams}`
        );
        apiResult = response.data;
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Erreur serveur"];
    }

    res.render("pages/back-end/auteurs/list.njk", {
        list_authors: apiResult,   // 🔥 IMPORTANT
        list_errors: listErrors,
    });
});

/**
 * ADD AUTHOR FORM
 * GET /back-end/auteurs/add
 */
router.get("/add", (req, res) => {
    res.render("pages/back-end/auteurs/form.njk", {
        author: {},
        list_errors: [],
        is_edit: false,
    });
});

/**
 * EDIT AUTHOR FORM
 * GET /back-end/auteurs/:id
 */
router.get("/:id", async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let author = {};
    let listErrors = [];

    if (!isEdit) {
        return res.redirect(`${res.locals.admin_url}/${base}`);
    }

    try {
        const result = await axios.get(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`
        );
        author = result.data;
    } catch (e) {
        listErrors = e.response?.data?.errors || ["Auteur introuvable"];
    }

    res.render("pages/back-end/auteurs/form.njk", {
        author,
        list_errors: listErrors,
        is_edit: true,
    });
});

/**
 * CREATE AUTHOR
 * POST /back-end/auteurs/add
 */
router.post("/add", upload.single("image"), async (req, res) => {
    let ressource = {};
    let listErrors = [];

    const options = {
        method: "POST",
        url: `${res.locals.base_url}/api/${ressourceNameInApi.authors}`,
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

    if (listErrors.length) {
        return res.render("pages/back-end/auteurs/form.njk", {
            author: ressource,
            list_errors: listErrors,
            is_edit: false,
        });
    }

    return res.redirect(`${res.locals.admin_url}/${base}`);
});

/**
 * UPDATE AUTHOR
 * POST /back-end/auteurs/:id
 */
router.post("/:id", upload.single("image"), async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let ressource = {};
    let listErrors = [];

    if (!isEdit) {
        return res.redirect(`${res.locals.admin_url}/${base}`);
    }

    const options = {
        method: "PUT",
        url: `${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`,
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

    // Si erreurs -> rester sur form
    if (listErrors.length) {
        return res.render("pages/back-end/auteurs/form.njk", {
            author: ressource,
            list_errors: listErrors,
            is_edit: true,
        });
    }

    // Si OK -> revenir sur la liste
    return res.redirect(`${res.locals.admin_url}/${base}`);
});

/**
 * DELETE AUTHOR
 * POST /back-end/auteurs/:id/delete
 */
router.post("/:id/delete", async (req, res) => {
    const isValid = mongoose.Types.ObjectId.isValid(req.params.id);

    if (!isValid) {
        return res.redirect(`${res.locals.admin_url}/${base}`);
    }

    try {
        await axios.delete(
            `${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`
        );
    } catch (_e) {
        // optionnel : tu peux gérer flash message ici
    }

    return res.redirect(`${res.locals.admin_url}/${base}`);
});

export default router;
