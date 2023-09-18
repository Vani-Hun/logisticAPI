import express from "express";
import {
    sendError,
    sendServerError,
    sendSuccess,
} from "../helper/client.js";
import LifeStyle from "../model/LifeStyle.js";
const LifeStyleRoute = express.Router();

/**
 * @route GET /api/life-style/:id
 * @description get details of a LifeStyle
 * @access private
 */
LifeStyleRoute.get('/:id', async (req, res) => {
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

export default LifeStyleRoute;