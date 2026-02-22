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

/**
 * HOME -> Liste des articles publiés
 */
router.get("/", routeName("homepage"), async (req, res) => {
    let data = [];

    try {
        const response = await axios.get(`${res.locals.base_url}/api/articles`, {
            params: {
                ...req.query,
                is_active: "true",
                sorting: "desc",
            },
        });

        data = response.data?.data || [];
    } catch (_error) {
        data = [];
    }

    return res.render("pages/front-end/index.njk", {
        list_articles: data, // ✅ tableau
    });
});

/**
 * ARTICLE -> Détail par slug
 */
router.get("/articles/:slug", routeName("article"), async (req, res) => {
    let article = null;

    try {
        const response = await axios.get(
            `${res.locals.base_url}/api/articles/${req.params.slug}`
        );
        article = response.data;
    } catch (_error) {
        article = null;
    }

    if (!article) {
        return res
            .status(404)
            .render("pages/404.njk", { title: "404 - Page introuvable" });
    }

    return res.render("pages/front-end/article.nunjucks", {
        article,
    });
});

// "(.html)?" makes ".html" optional in the url
router.get("/a-propos(.html)?", routeName("about"), async (_req, res) => {
    let result = {};
    try {
        result = await axios.get(`${res.locals.base_url}/api/saes`, {
            params: { per_page: 9 },
        });
    } catch (_error) {}

    return res.render("pages/front-end/about.njk", {
        list_saes: result.data,
    });
});

router.get("/lieux(.html)?", routeName("lieux"), async (_req, res) => {
    let result = {};
    try {
        result = await axios.get(`${res.locals.base_url}/api/saes`, {
            params: { per_page: 9 },
        });
    } catch (_error) {}

    return res.render("pages/front-end/lieux.nunjucks", {
        list_saes: result.data,
    });
});

router.get("/sur-les-medias(.html)?", routeName("sur-les-medias"), async (_req, res) => {
    let result = {};
    try {
        result = await axios.get(`${res.locals.base_url}/api/saes`, {
            params: { per_page: 9 },
        });
    } catch (_error) {}

    return res.render("pages/front-end/sur-les-medias.nunjucks", {
        list_saes: result.data,
    });
});

router.get("/contact(.html)?", routeName("contact"), async (_req, res) => {
    let result = {};
    try {
        result = await axios.get(`${res.locals.base_url}/api/saes`, {
            params: { per_page: 9 },
        });
    } catch (_error) {}

    return res.render("pages/front-end/contact.nunjucks", {
        list_saes: result.data,
    });
});

export default router;
