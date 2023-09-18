import express from "express";
import {
    sendError,
    sendServerError,
    sendSuccess,
} from "../../helper/client.js";
import LifeStyle from "../../model/LifeStyle.js";
import { lifeStyleValidate } from "../../validation/lifeStyle.js";
import multer from 'multer';
import { uploadResourcesOrderIssueImage, uploadImage } from "../../middleware/storage.js";
import { createImageAboutUs, createContainerImage } from '../../middleware/createDir.js';
import { uploadSingle, deleteSingle } from "../../helper/connectCloud.js";
import fs from 'fs';
const LifeStyleAdminRoute = express.Router();
/**
 * @route POST /api/admin/life-style/
 * @description create an LifeStyle
 * @access private
 */
LifeStyleAdminRoute.post('/', createImageAboutUs, createContainerImage,
    uploadImage.fields([{ name: 'containerImage', maxCount: 6 }, { name: 'imageAboutUs', maxCount: 1 }])
    , async (req, res) => {
        try {
            const { descriptionAboutUs } = req.body;
            const containerImages = req.files['containerImage'] ? req.files['containerImage'] : null;

            const imageAboutUs = req.files['imageAboutUs'] ? req.files['imageAboutUs'][0].path : null;
            const checkValue = { containerImages, imageAboutUs, descriptionAboutUs }
            const errors = lifeStyleValidate(checkValue);
            if (errors) return sendError(res, errors);
            const listContainerImages = [];
            if (containerImages && containerImages.length > 0) {
                const containerImagePaths = containerImages.map(file => file.path);
                await Promise.all(containerImagePaths.map(async imagePath => {
                    const parts = imagePath.split('\\');
                    const resultContainerImage = await uploadSingle(imagePath, parts[1], parts[2]);
                    listContainerImages.push(resultContainerImage);
                    if (imagePath) {
                        fs.unlinkSync(imagePath);
                    }
                }));
            }
            const partsImageAboutUs = imageAboutUs.split('\\');
            const resultimageAboutUs = await uploadSingle(imageAboutUs, partsImageAboutUs[1], partsImageAboutUs[2]);
            if (imageAboutUs) {
                fs.unlinkSync(imageAboutUs);
            }
            const newLifeStyle = new LifeStyle({
                imageAboutUs: resultimageAboutUs,
                descriptionAboutUs,
                containerImage: listContainerImages
            });
            await newLifeStyle.save();
            sendSuccess(res, { message: 'New LifeStyle created successfully' }, newLifeStyle);
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    });

/**
 * @route PUT /api/admin/life-style/:id
 * @description update an existing LifeStyle
 * @access private
 */
LifeStyleAdminRoute.put('/:id', createImageAboutUs, createContainerImage,
    uploadImage.fields([{ name: 'containerImage', maxCount: 6 }, { name: 'imageAboutUs', maxCount: 1 }])
    , async (req, res) => {
        try {
            const lifestyleId = req.params.id;
            const { descriptionAboutUs } = req.body;
            const containerImages = req.files['containerImage'];
            const imageAboutUs = req.files['imageAboutUs'] ? req.files['imageAboutUs'][0].path : null;
            const checkValue = { containerImages, imageAboutUs, descriptionAboutUs }
            const errors = lifeStyleValidate(checkValue);
            if (errors) return sendError(res, errors);

            const listContainerImages = [];
            if (containerImages && containerImages.length > 0) {
                const containerImagePaths = containerImages.map(file => file.path);
                await Promise.all(containerImagePaths.map(async imagePath => {
                    const parts = imagePath.split('\\');
                    const resultContainerImage = await uploadSingle(imagePath, parts[1], parts[2]);
                    listContainerImages.push(resultContainerImage);
                    if (imagePath) {
                        fs.unlinkSync(imagePath);
                    }
                }));
            }

            const partsImageAboutUs = imageAboutUs.split('\\');
            const resultImageAboutUs = await uploadSingle(imageAboutUs, partsImageAboutUs[1], partsImageAboutUs[2]);

            const updatedFields = {
                imageAboutUs: resultImageAboutUs,
                descriptionAboutUs,
                containerImage: listContainerImages
            };

            await LifeStyle.findByIdAndUpdate(lifestyleId, updatedFields, { new: true });
            sendSuccess(res, { message: 'LifeStyle updated successfully' });
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    });
/**
 * @route GET /api/admin/life-style/:id
 * @description get details of a LifeStyle
 * @access private
 */
LifeStyleAdminRoute.get('/:id', async (req, res) => {
    try {
        const lifestyleId = req.params.id;

        const foundLifeStyle = await LifeStyle.findById(lifestyleId);

        if (!foundLifeStyle) {
            return sendError(res, { message: 'LifeStyle not found' }, 404);
        }

        sendSuccess(res, { message: 'LifeStyle details retrieved successfully' }, foundLifeStyle);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
/**
 * @route GET /api/admin/life-style/
 * @description get a list of LifeStyles
 * @access private
 */
LifeStyleAdminRoute.get('/', async (req, res) => {
    try {
        const lifeStyles = await LifeStyle.find();
        if (lifeStyles.length < 1) return sendError(res, "No lifeStyle yet")
        sendSuccess(res, { message: 'List of LifeStyles retrieved successfully' }, lifeStyles);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
/**
 * @route GET /api/admin/life-style/:id
 * @description delete a LifeStyle
 * @access private
 */
LifeStyleAdminRoute.delete('/:id', async (req, res) => {
    try {
        const lifestyleId = req.params.id;
        const foundLifeStyle = await LifeStyle.findById(lifestyleId);
        if (!foundLifeStyle) {
            return res.status(404).json({ message: 'LifeStyle not found' });
        }
        await foundLifeStyle.remove();
        return res.status(200).json({ message: 'LifeStyle deleted successfully' });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
export default LifeStyleAdminRoute;