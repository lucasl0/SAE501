import express from "express";
import axios from "axios";

import routeName from "#server/utils/name-route.middleware.js";
import parseManifest from "#server/utils/parse-manifest.js";

const router = express.Router();

router.use(async (_req, res, next) => {
    const originalRender = res.render;
    res.render = async function (view, local, callback) {
        const manifest = {
            manifest: await parseManifest("frontend.manifest.json"),
        };

        const args = [view, { ...local, ...manifest }, callback];
        originalRender.apply(this, args);
    };

    next();
});

router.get("/", routeName("homepage"), async (req, res) => {
    const params = new URLSearchParams({ ...req.query, is_active: "true", per_page: "20" }).toString();

    let listArticles = { data: [], count: 0, total_pages: 1, page: 1, query_params: "" };

    try {
        const result = await axios.get(`${res.locals.base_url}/api/articles?${params}`);
        listArticles = result.data;
    } catch (_error) {}

    res.render("pages/front-end/index.njk", {
        list_articles: listArticles,
    });
});

// "(.html)?" makes ".html" optional in the url
router.get("/a-propos(.html)?", routeName("about"), async (_req, res) => {
    const options = {
        method: "GET",
        url: `${res.locals.base_url}/api/saes?per_page=9`,
    };

    let result = {};
    try {
        result = await axios(options);
    } catch (_error) {}

    res.render("pages/front-end/about.njk", {
        list_saes: result.data,
    });
});
// Nouvelle routes 


export default router;
