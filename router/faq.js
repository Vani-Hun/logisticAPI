import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import Faq from "../model/FAQ.js";
const faqRoute = express.Router()

/**
 * @route GET /api/faq
 * @description user get all faqs with filter by keyword
 * @access private
 */
faqRoute.get('/', async (req, res) => {
    try {
        let { keyword } = req.body;
        let { question, page, pageSize } = req.query;
        pageSize = pageSize ? parseInt(req.query.pageSize) : 0;
        page = page ? parseInt(req.query.page) : 0;
        var query = {};
        var keywordList = keyword
            ? {
                question: { $regex: keyword, $options: "i" }
            }
            : {};
        if (question) {
            query.question = question;
        }
        const length = await Faq.find({ $and: [query, keywordList] }).count()
        const list = await Faq.find({ $and: [query, keywordList] })
            .skip(pageSize * page)
            .limit(pageSize);

        if (list)
            return sendSuccess(res, "Get FAQ list successfully.", { length, list });
        return sendError(res, "FAQ not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default faqRoute;