import express from "express";
import {
    sendError,
    sendServerError,
    sendSuccess,
} from "../../helper/client.js";
import Faq from "../../model/FAQ.js";
import { faqValidate } from "../../validation/faq.js";
import FAQ from "../../model/FAQ.js";
const faqAdminRoute = express.Router();

/**
 * @route POST /api/admin/faq/
 * @description admin create a new FAQ
 * @access private
 */
faqAdminRoute.post('/', async (req, res) => {
    const errors = faqValidate(req.body);
    if (errors) return sendError(res, errors);
    try {
        let { question, answer } = req.body;
        const _question = question.toString().trim().toLowerCase();
        const isExist = await Faq.findOne({ question: _question });
        if (isExist) return sendError(res, "This FAQ already exists");
        const newFaq = await Faq.create({ question, answer });
        return sendSuccess(res, "Create new FAQ successfully.", newFaq);
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
});

/**
 * @route GET /api/admin/faq/
 * @description admin get faq list
 * @access private
 */
faqAdminRoute.get('/', async (req, res) => {
    try {
        const { page, pageSize } = req.query;
        const list = await Faq.find()
            .skip(pageSize * page)
            .limit(pageSize);
        if (list)
            return sendSuccess(res, "Get FAQs successfully.", list);
        return sendError(res, "FAQ not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route POST /api/admin/faq/id
 * @description admin get a faq
 * @access private
 */
faqAdminRoute.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const curFaq = await Faq.findOne({_id: id});
        if (!curFaq) return sendError(res, "FAQ not found.");
        return sendSuccess(res, "Get FAQ successfully.", curFaq);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route POST /api/admin/faq/id
 * @description admin update a faq
 * @access private
 */
faqAdminRoute.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { question, answer } = req.body;
        const _question = question.toString().trim().toLowerCase();
        const errors = faqValidate(req.body);
        if (errors) return sendError(res, errors);
        const faq = await Faq.findOne({ question: _question, _id: { $ne: id } });
        if (faq) return sendError(res, "This FAQ already exists");
        const updateFaq = await Faq.findByIdAndUpdate(id, { question, answer }, { new: true });
        if (!updateFaq) return sendError(res, "FAQ not found");
        return sendSuccess(res, "Updated FAQ successfully", updateFaq);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route DELETE /api/admin/faq/id
 * @description admin update a faq
 * @access private
 */
faqAdminRoute.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await Faq.findByIdAndDelete(id);
        if (!faq) return sendError(res, "FAQ not found");
        sendSuccess(res, "Deleted FAQ successfully");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default faqAdminRoute;