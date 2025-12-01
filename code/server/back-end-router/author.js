import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import querystring from "querystring";
import FormData from "form-data";

import { ressourceNameInApi } from "./utils.js";
import upload from "#server/uploader.js";

const base = "auteurs";
const router = express.Router();

/**
 * Get multiple authors
 */
router.get(`/${base}`, async (req, res) => {
    const queryParams = querystring.stringify({ per_page: 7, ...req.query });
    const options = {
        method: "GET",
        url: `${res.locals.base_url}/api/${ressourceNameInApi.authors}?${queryParams}`,
    };

    let result = {};
    let listErrors = [];

    try {
        result = await axios(options);
    } catch (error) {
        listErrors = error.response?.data?.errors || ["Unknown error"];
    }

    res.render("pages/back-end/auteurs/list.njk", {
        list_authors: result.data || [],
        list_errors: listErrors,
    });
});

/**
 * Get single author or show add form
 */
router.get([`/${base}/:id`, `/${base}/add`], async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let result = {};
    let listErrors = [];

    if (isEdit) {
        try {
            const response = await axios({
                method: "GET",
                url: `${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`,
            });
            result = response.data;
        } catch (e) {
            listErrors = e.response?.data?.errors || ["Unknown error"];
        }
    }

    res.render("pages/back-end/auteurs/form.njk", {
        author: result || {},
        list_errors: listErrors,
        is_edit: isEdit,
    });
});

/**
 * Create or update author
 */
router.post([`/${base}/:id`, `/${base}/add`], upload.single("image"), async (req, res) => {
    const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);
    let listErrors = [];
    let ressource = null;

    // Prepare FormData for file upload
    const formData = new FormData();
    Object.entries(req.body).forEach(([key, value]) => formData.append(key, value));
    if (req.file) formData.append("image", req.file.buffer, req.file.originalname);

    const options = {
        method: isEdit ? "PUT" : "POST",
        url: isEdit
            ? `${res.locals.base_url}/api/${ressourceNameInApi.authors}/${req.params.id}`
            : `${res.locals.base_url}/api/${ressourceNameInApi.authors}`,
        headers: formData.getHeaders(),
        data: formData,
    };

    try {
        const result = await axios(options);
        ressource = result.data;
    } catch (e) {
        listErrors = e.response?.data?.errors || ["Unknown error"];
        ressource = e.response?.data?.ressource || {};
    }

    if (listErrors.length || isEdit) {
        res.render("pages/back-end/auteurs/form.njk", {
            author: ressource,
            list_errors: listErrors,
            is_edit: isEdit,
        });
    } else {
        res.redirect(`${res.locals.admin_url}/${base}`);
    }
});

export default router;
