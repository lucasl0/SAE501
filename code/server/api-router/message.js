import express from "express";
import querystring from "querystring";

import routeName from "#server/utils/name-route.middleware.js";
import Message from "#models/message.js";

const router = express.Router();
const base = "messages";

/**
 * GET /api/messages
 * Admin only (UI). Pagination ok.
 */
router.get(`/${base}`, routeName("messages_api_list"), async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.min(Math.max(Number(req.query.per_page) || 10, 1), 50);

    try {
        const data = await Message.find({})
            .sort({ created_at: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .lean();

        const count = await Message.countDocuments();
        const total_pages = Math.ceil(count / perPage);

        const queryParam = { ...req.query };
        delete queryParam.page;

        return res.status(200).json({
            data,
            total_pages: isFinite(total_pages) ? total_pages : 1,
            count,
            page,
            query_params: querystring.stringify(queryParam),
        });
    } catch (e) {
        return res.status(400).json({
            errors: [e?.message || "Il y a eu un problème"],
        });
    }
});

/**
 * POST /api/messages
 * Front only (formulaire contact).
 */
router.post(`/${base}`, routeName("message_api_create"), async (req, res) => {
    try {
        const payload = {
            lastname: req.body.lastname,
            firstname: req.body.firstname,
            email: req.body.email,
            content: req.body.content,
            identity: req.body.identity || "non_precise",
        };

        const msg = new Message(payload);
        await msg.save();

        return res.status(201).json(msg);
    } catch (e) {
        return res.status(400).json({
            errors: Object.values(e?.errors || [{ message: e?.message || "Il y a eu un problème" }]).map(
                (val) => val.message
            ),
            ressource: req.body,
        });
    }
});

export default router;
