import express from "express";
import {
    sendError,
    sendServerError,
    sendSuccess,
} from "../../helper/client.js";
import Policy from "../../model/Policy.js";
import { policyValidate } from "../../validation/policy.js";
const policyAdminRoute = express.Router();

/**
 * @route POST /api/admin/policy/
 * @description admin create a new FAQ
 * @access private
 */
policyAdminRoute.post('/', async (req, res) => {
    const errors = policyValidate(req.body);
    if(errors) return sendError(res, errors);
    try {    
        const policies = await Policy.find();
        if (policies.length > 0) return sendError(res, "Policy already exists");
        const newPolicy = await Policy.create(req.body);
        return sendSuccess(res, "Create new Policy successfully.", newPolicy);
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
});

/**
 * @route GET /api/admin/policy/
 * @description admin get policy
 * @access private
 */
policyAdminRoute.get('/', async (req, res) => {
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

/**
 * @route POST /api/admin/policy
 * @description admin update policy
 * @access private
 */
policyAdminRoute.put('/', async (req, res) => {
    try {
        const errors = policyValidate(req.body);
        if (errors) return sendError(res, errors);
        const policies = await Policy.find();
        if(policies.length == 0) return sendError(res, "Policy not found");
        const updatePolicy = await Policy.findOneAndUpdate({}, req.body, { new: true });
        if(!updatePolicy) return sendError(res, "Update Policy fail");
        return sendSuccess(res, "Updated Policy successfully", updatePolicy);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route DELETE /api/admin/policy/id
 * @description admin update a policy
 * @access private
 */
policyAdminRoute.delete('/', async (req, res) => {
    try {
        const policies = await Policy.find();
        if(policies.length == 0) return sendError(res, "Policy not found");
        const policy = await Policy.deleteOne();
        if(policy) return sendSuccess(res, "Deleted Policy successfully");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default policyAdminRoute;