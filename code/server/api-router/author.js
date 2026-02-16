import express from "express";
import fs from "fs";
import mongoose from "mongoose";
import querystring from "querystring";

import Author from "#models/author.js";
import upload, { uploadImage, deleteUpload } from "#server/uploader.js";

const router = express.Router();
const base = "authors";

/**
 * GET /authors
 */
router.get(`/${base}`, async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);

    // per_page peut être vide => éviter NaN
    const perPageRaw = Number(req.query.per_page);
    const perPage = Number.isFinite(perPageRaw) && perPageRaw > 0 ? perPageRaw : null;

    let listIds = req.query?.id;
    if (req.query.id && !Array.isArray(req.query.id)) {
        listIds = [listIds];
    }

    listIds = (listIds || [])
        .filter(mongoose.Types.ObjectId.isValid)
        .map((item) => mongoose.Types.ObjectId.createFromHexString(item));

    try {
        const listRessources = await Author.aggregate([
            ...(listIds.length ? [{ $match: { _id: { $in: listIds } } }] : []),
            { $sort: { lastname: 1 } },
            ...(perPage ? [{ $skip: Math.max(page - 1, 0) * perPage }] : []),
            ...(perPage ? [{ $limit: perPage }] : []),
            {
                $project: {
                    _id: 1,
                    lastname: 1,
                    firstname: 1,
                    image: 1,
                    bio: 1,
                    email: 1,
                    nb_articles: { $size: "$list_articles" },
                },
            },
        ]);

        const count = await Author.countDocuments(listIds.length ? { _id: { $in: listIds } } : {});
        const total_pages = perPage ? Math.ceil(count / perPage) : 1;

        const queryParam = { ...req.query };
        delete queryParam.page;

        res.status(200).json({
            data: listRessources,
            total_pages: isFinite(total_pages) ? total_pages : 1,
            count,
            page,
            query_params: querystring.stringify(queryParam),
        });
    } catch (e) {
        res.status(400).json({
            errors: [
                ...Object.values(
                    e?.errors || [{ message: e?.message || "Il y a eu un problème" }]
                ).map((val) => val.message),
            ],
        });
    }
});

/**
 * GET /authors/:id
 */
router.get(`/${base}/:id([a-f0-9]{24})`, async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    let perPage = Number(req.query.per_page) || 7;
    perPage = Math.min(Math.max(perPage, 1), 20);

    try {
        const ressource = await Author.aggregate([
            { $match: { _id: mongoose.Types.ObjectId.createFromHexString(req.params.id) } },
            {
                $addFields: {
                    nb_articles: { $size: "$list_articles" },
                    page: Number(page),
                    total_pages: {
                        $ceil: { $divide: [{ $size: "$list_articles" }, perPage] },
                    },
                },
            },
            {
                $lookup: {
                    from: "articles",
                    localField: "list_articles",
                    foreignField: "_id",
                    as: "list_articles",
                    pipeline: [
                        { $sort: { created_at: -1 } },
                        { $skip: Math.max(page - 1, 0) * perPage },
                        { $limit: perPage },
                    ],
                },
            },
            {
                $addFields: {
                    list_articles: {
                        $map: {
                            input: "$list_articles",
                            as: "article",
                            in: {
                                $mergeObjects: [
                                    "$$article",
                                    { nb_comments: { $size: "$$article.list_comments" } },
                                ],
                            },
                        },
                    },
                },
            },
            { $unset: ["list_articles.list_comments"] },
        ]);

        if (!ressource.length) {
            return res.status(404).json({
                errors: [`L'auteur "${req.params.id}" n'existe pas`],
            });
        }

        return res.status(200).json(ressource[0]);
    } catch (err) {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                errors: [`"${req.params.id}" n'est pas un id valide`],
            });
        }

        return res.status(400).json({
            errors: [
                ...Object.values(
                    err?.errors || [{ message: "Quelque chose s'est mal passé" }]
                ).map((val) => val.message),
            ],
        });
    }
});

/**
 * POST /authors
 */
router.post(`/${base}`, upload.single("image"), async (req, res) => {
    let imagePayload = {};
    let listErrors = [];
    let targetPath = undefined;

    const uploadedImage = req.body.file || req.file;

    if (uploadedImage) {
        let imageName;
        ({
            image_path: targetPath,
            errors: listErrors,
            image_name: imageName,
        } = await uploadImage(uploadedImage, res.locals.upload_path));
        imagePayload = { image: imageName };
    }

    if (listErrors.length) {
        return res.status(400).json({
            errors: listErrors,
            ressource: req.body,
        });
    }

    const ressource = new Author({ ...req.body, ...imagePayload });

    await ressource
        .save()
        .then(() => res.status(201).json(ressource))
        .catch((err) => {
            res.status(400).json({
                errors: [
                    ...listErrors,
                    ...deleteUpload(targetPath),
                    ...Object.values(err?.errors || [{ message: "Quelque chose s'est mal passé" }]).map(
                        (val) => val.message
                    ),
                ],
            });
        });
});

/**
 * PUT /authors/:id
 */
router.put(`/${base}/:id([a-f0-9]{24})`, upload.single("image"), async (req, res) => {
    let imagePayload = {};
    let listErrors = [];
    let targetPath = undefined;

    const uploadedImage = req.body.file || req.file;

    if (uploadedImage) {
        let imageName;
        ({
            image_path: targetPath,
            errors: listErrors,
            image_name: imageName,
        } = await uploadImage(uploadedImage, res.locals.upload_path));
        imagePayload = { image: imageName };
    }

    let oldRessource = {};
    try {
        oldRessource = await Author.findById(req.params.id).lean();
    } catch (_error) {
        oldRessource = {};
    }

    if (listErrors.length) {
        return res.status(400).json({
            errors: listErrors,
            ressource: { ...oldRessource, ...req.body },
        });
    }

    const ressource = await Author.findOneAndUpdate(
        { _id: req.params.id },
        { ...req.body, _id: req.params.id, ...imagePayload },
        { new: true }
    )
        .orFail()
        .catch((err) => {
            if (err instanceof mongoose.Error.DocumentNotFoundError) {
                res.status(404).json({ errors: [`L'auteur "${req.params.id}" n'existe pas`] });
            } else if (err instanceof mongoose.Error.CastError) {
                res.status(400).json({
                    errors: [...listErrors, "Élément non trouvé", ...deleteUpload(targetPath)],
                });
            } else {
                res.status(400).json({
                    errors: [
                        ...listErrors,
                        ...Object.values(err?.errors || [{ message: "Il y a eu un problème" }]).map(
                            (val) => val.message
                        ),
                        ...deleteUpload(targetPath),
                    ],
                    ressource: { ...oldRessource, ...req.body },
                });
            }
        });

    return res.status(200).json(ressource);
});

/**
 * DELETE /authors/:id
 */
router.delete(`/${base}/:id([a-f0-9]{24})`, async (req, res) => {
    try {
        const ressource = await Author.findByIdAndDelete(req.params.id);

        if (ressource?.image) {
            const targetPath = `${res.locals.upload_path}${ressource.image}`;
            fs.unlink(targetPath, () => {});
        }

        if (ressource) {
            return res.status(200).json(ressource);
        }

        return res.status(404).json({
            errors: [`L'auteur "${req.params.id}" n'existe pas`],
        });
    } catch (_error) {
        return res.status(400).json({
            errors: ["Quelque chose s'est mal passé, veuillez recommencer"],
        });
    }
});

export default router;
