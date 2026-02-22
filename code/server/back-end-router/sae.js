import express from "express";
import mongoose from "mongoose";
import axios from "axios";
import querystring from "querystring";
import routeName from "#server/utils/name-route.middleware.js";
import upload from "#server/uploader.js";

import { ressourceNameInApi } from "./utils.js";

const base = "saes";
const router = express.Router();


// =============================
// LISTE SAE
// =============================
router.get(`/${base}`, routeName("sae_list"), async (req, res) => {
    const queryParams = querystring.stringify(req.query);

    const options = {
        method: "GET",
        url: `${res.locals.base_url}/api/${ressourceNameInApi.saes}?${queryParams}`,
    };

    let result = null;
    let listErrors = [];

    try {
        result = await axios(options);
    } catch (error) {
        listErrors = error?.response?.data?.errors || ["Erreur API SAE"];
    }

    return res.render("pages/back-end/saes/list.njk", {
        list_saes: {
            data: result?.data?.data || [],
            count: result?.data?.count || 0,
            page: result?.data?.page || 1,
            total_pages: result?.data?.total_pages || 1,
            query_params: result?.data?.query_params || "",
        },
        list_errors: listErrors,
    });
});


// =============================
// FORM + CREATE / UPDATE SAE
// =============================
router
    .route([`/${base}/:id([a-f0-9]{24})`, `/${base}/add`])

    // ---------- GET FORM ----------
    .get(routeName("sae_form"), async (req, res) => {
        const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);

        let result = null;
        let listErrors = [];

        if (isEdit) {
            const options = {
                method: "GET",
                url: `${res.locals.base_url}/api/${ressourceNameInApi.saes}/${req.params.id}`,
            };

            try {
                result = await axios(options);
            } catch (error) {
                listErrors = error?.response?.data?.errors || ["Erreur API SAE"];
            }
        }

        return res.render("pages/back-end/saes/add-edit.njk", {
            sae: result?.data || {},
            list_errors: listErrors,
            is_edit: isEdit,
        });
    })


    // ---------- POST (CREATE / UPDATE) ----------
    .post(routeName("sae_form"), upload.single("image"), async (req, res) => {
        const isEdit = mongoose.Types.ObjectId.isValid(req.params.id);

        let ressource = null;
        let listErrors = [];

        let options = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            data: {
                ...req.body,
                file: req.file,
            },
        };

        if (isEdit) {
            options = {
                ...options,
                method: "PUT",
                url: `${res.locals.base_url}/api/${ressourceNameInApi.saes}/${req.params.id}`,
            };
        } else {
            options = {
                ...options,
                method: "POST",
                url: `${res.locals.base_url}/api/${ressourceNameInApi.saes}`,
            };
        }

        try {
            const result = await axios(options);
            ressource = result.data;
        } catch (error) {
            listErrors = error?.response?.data?.errors || ["Erreur API SAE"];
            ressource = error?.response?.data?.ressource || { ...req.body };
        }

        if (!listErrors.length) {
            req.flash("success", isEdit ? "Element mis à jour" : "Element créé");
        }

        if (isEdit || listErrors.length) {
            return res.render("pages/back-end/saes/add-edit.njk", {
                sae: ressource,
                list_errors: listErrors,
                is_edit: isEdit,
            });
        }

        return res.redirect(`${res.locals.admin_url}/${base}`);
    });

export default router;
