import express from "express";
import axios from "axios";

import routeName from "#server/utils/name-route.middleware.js";
import parseManifest from "#server/utils/parse-manifest.js";

// Routers
import SAERouter from "./sae.js";
import articleRouter from "./article.js";
import authorsRouter from "./author.js";
import messageRouter from "./message.js";

const router = express.Router();

router.use(async (_req, res, next) => {
    const originalRender = res.render;
    res.render = async function (view, local, callback) {
        const manifest = {
            manifest: await parseManifest("backend.manifest.json"),
        };

        const args = [view, { ...local, ...manifest }, callback];
        originalRender.apply(this, args);
    };

    next();
});

router.use(SAERouter);
router.use("/articles", articleRouter);
router.use("/auteurs", authorsRouter);
router.use("/messages", messageRouter);

router.get("/", routeName("admin"), async (_req, res) => {
    let list_saes = { data: [], count: 0 };
    let list_articles = { data: [], count: 0 };
    let list_messages = { data: [], count: 0 };

    try {
        const [saesRes, articlesRes, messagesRes] = await Promise.all([
            axios.get(`${res.locals.base_url}/api/saes?per_page=5`),
            axios.get(`${res.locals.base_url}/api/articles?per_page=5`),
            axios.get(`${res.locals.base_url}/api/messages?per_page=5`),
        ]);

        list_saes = { data: saesRes.data.data, count: saesRes.data.count };
        list_articles = { data: articlesRes.data.data, count: articlesRes.data.count };
        list_messages = { data: messagesRes.data.data, count: messagesRes.data.count };
    } catch (_e) {
        // si une API plante, on affiche juste des listes vides
    }

    res.render("pages/back-end/index.njk", {
        list_saes,
        list_articles,
        list_messages,
    });
});

export default router;
