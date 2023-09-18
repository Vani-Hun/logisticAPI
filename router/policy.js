import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import Policy from "../model/Policy.js";
const policyRoute = express.Router()

/**
 * @route GET /api/policy
 * @description user get policy
 * @access private
 */
policyRoute.get('/', async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const policy = await Policy.find()
            .skip(pageSize * page)
            .limit(pageSize);
        if (policy)
            return sendSuccess(res, "Get Policy successfully.", policy);
        return sendError(res, "Policy not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default policyRoute;