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
    const queryParams = new URLSearchParams(req.query).toString();
    const options = {
        method: "GET",
        url: `${res.locals.base_url}/api/articles?${queryParams}&is_active=true`,
    };
    let result = {};
    try {
        result = await axios(options);
    } catch (_error) {}

    res.render("pages/front-end/index.njk", {
        list_articles: result.data,
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

router.get("/lieux(.html)?", routeName("places"), async (req, res) => {
    // Logique pour récupérer les lieux de vie
    const options = {
      method: "GET",
      url: `${res.locals.base_url}/api/places?is_active=true`,
    };
    let result = {};
    try {
      result = await axios(options);
    } catch (_error) {}
  
    res.render("pages/front-end/places.njk", {
      list_places: result.data,
    });
  });
  
  router.get("/sur-les-medias(.html)?", routeName("media"), async (req, res) => {
    // Logique pour récupérer les médias
    const options = {
      method: "GET",
      url: `${res.locals.base_url}/api/media?is_active=true`,
    };
    let result = {};
    try {
      result = await axios(options);
    } catch (_error) {}
  
    res.render("pages/front-end/media.njk", {
      list_media: result.data,
    });
  });
  
  router.get("/contact(.html)?", routeName("contact"), async (req, res) => {
    res.render("pages/front-end/contact.njk");
  });

export default router;
