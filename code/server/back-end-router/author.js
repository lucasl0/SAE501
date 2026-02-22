import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import upload from "#server/uploader.js";
import { ressourceNameInApi } from "./utils.js"; // Correct relative path

const base = "auteurs";
const router = express.Router();

// LIST AUTHORS
router.get("/", async (req, res) => {
    const queryParams = new URLSearchParams({ per_page: 7, ...req.query }).toString();
    let result = {};
    let listErrors = [];

    try {
        result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.authors}?${queryParams}`);
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Erreur serveur"];
    }

    res.render("pages/back-end/auteurs/list.njk", {
        list_authors: result.data ?? {
            data: [],
            count: 0,
            total_pages: 1,
            page: 1,
            query_params: "",
        },
        list_errors: listErrors,
    });
});

// ADD AUTHOR FORM
router.get("/add", (req, res) => {
    res.render("pages/back-end/auteurs/form.njk", {
        author: {},
        list_errors: [],
        is_edit: false,
    });
});

// EDIT AUTHOR FORM
router.get("/:id", async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let author = {};
    let listErrors = [];

    if (isEdit) {
        try {
            const result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`);
            author = result.data;
        } catch (e) {
            listErrors = e.response?.data?.errors || [];
        }
    }

    res.render("pages/back-end/auteurs/form.njk", {
        author,
        list_errors: listErrors,
        is_edit: isEdit,
    });
});

// CREATE OR UPDATE AUTHOR
router.post(["/add", "/:id"], upload.single("image"), async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let options = {
        headers: { "Content-Type": "multipart/form-data" },
        data: { ...req.body, file: req.file },
    };
    let ressource = {};
    let listErrors = [];

    if (isEdit) {
        options.method = "PUT";
        options.url = `${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`;
    } else {
        options.method = "POST";
        options.url = `${res.locals.base_url}/api/${ressourceNameInApi.authors}`;
    }

    try {
        const result = await axios(options);
        ressource = result.data;
    } catch (e) {
        listErrors = e.response?.data?.errors || [];
        ressource = e.response?.data?.ressource || {};
    } finally {
        if (listErrors.length || isEdit) {
            res.render("pages/back-end/auteurs/form.njk", {
                author: ressource,
                list_errors: listErrors,
                is_edit: isEdit,
            });
        } else {
            res.redirect(`${res.locals.admin_url}/${base}`);
        }
    }
});

export default router;
