import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import upload from "../uploader.js"; // fixed relative path
import { ressourceNameInApi } from "./utils.js";  // Correct relative path

const base = "articles";
const router = express.Router();

// LIST ARTICLES
router.get(`/${base}`, async (req, res) => {
    let listErrors = [];
    let articles = [];

    try {
        const result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.articles}`);
        articles = result.data.data || [];
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Erreur serveur"];
    }

    console.log("Tesy", articles)

    res.render("pages/back-end/articles/list.njk", {
        list_articles: articles, // comme ton template articles
        list_errors: listErrors,
    });
});

// ADD ARTICLE FORM
router.get(`/${base}/add`, async (req, res) => {
    let listAuthors = [];
    try {
        const result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.authors}`);
        listAuthors = result.data.data || [];
    } catch {}

    res.render("pages/back-end/articles/add-edit.njk", {
        article: {},
        list_authors: listAuthors,
        list_errors: [],
        is_edit: false,
    });
});



// EDIT ARTICLE FORM
router.get(`/${base}/:id`, async (req, res, next) => {
    if(!Number.isInteger(req.params.id)) {
        return next()
    }
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let article = {};
    let listErrors = [];
    let listAuthors = [];

    try {
        if (isEdit) {
            const result = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.articles}/${req.params.id}`);
            article = result.data;
        }

        const authorsResult = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.authors}`);
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

// CREATE OR UPDATE ARTICLE
router.post([`/${base}/add`, `/${base}/:id`], upload.single("image"), async (req, res) => {
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

        const authorsResult = await axios.get(`${res.locals.base_url}/api/${ressourceNameInApi.authors}`);
        listAuthors = authorsResult.data.data || [];
    } catch (e) {
        listErrors = e.response?.data?.errors || [];
        ressource = e.response?.data?.ressource || {};
    } finally {
        if (listErrors.length || isEdit) {
            res.render("pages/back-end/articles/add-edit.njk", {
                article: ressource,
                list_authors: listAuthors,
                list_errors: listErrors,
                is_edit: isEdit,
            });
        } else {
            res.redirect(`${res.locals.admin_url}/${base}`);
        }
    }
});

export default router;
