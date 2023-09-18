import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../helper/client.js'
import Strength from '../model/Strength.js'

const strengthRoute = express.Router()

/**
 * @route GET /api/strength
 * @description get strength information
 * @access public
 */
strengthRoute.get("/", async (req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
        const page = req.query.page ? parseInt(req.query.page) : 0;
        const { keyword, sortBy, detail, name, sub_name } = req.query;
        var query = {};
        var keywordCondition = keyword
            ? {
                $or: [
                    { name: { $regex: keyword, $options: "i" } },
                    { detail: { $regex: keyword, $options: "i" } },
                ],
            }
            : {};
        if (detail) {
            query.detail = detail;
        }
        if (name) {
            query.name = name;
        }
        if (sub_name) {
            query.sub_name = sub_name;
        }
        if (keyword) {
            query.keyword = keyword;
        }
        if (sortBy) {
            query.sortBy = sortBy;
        }
        const strength = await Strength.find({ $and: [query, keywordCondition] })
            .limit(pageSize)
            .skip(pageSize * page)
            .sort(`${sortBy}`)
        var length = await Strength.find({ $and: [query, keywordCondition] }).count();
        if (strength.length == 0)
            return sendError(res, "Strength information is not found.");
        if (strength)
            return sendSuccess(res, "Get strength information successfully.", { length, strength });
        return sendError(res, "Strength information is not found.");
    } catch (error) {
        return sendServerError(res);
    }
});
/**
 * @route GET /api/strength/public-homepage
 * @description get all strength are public-homepage
 * @access public
 */
strengthRoute.get("/public-homepage", async (req, res) => {
    try {
        const strengths = await Strength.find({ isPublicHomePage: true });
        if (strengths.length < 1) return sendError(res, "No strengths are public in homepage!!!");
        return sendSuccess(res, "Get all public strengths successfully!", strengths);
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
});

/**
 * @route GET /api/strength/public-homepage
 * @description get all strength are public in About us page
 * @access public
 */
strengthRoute.get("/public-about-us", async (req, res) => {
    try {
        const strengths = await Strength.find({ isPublicAboutUs: true });
        if (strengths.length < 1) return sendError(res, "No strengths are public in about us page!!!");
        return sendSuccess(res, "Get all public strengths successfully!", strengths);
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
});
/**
 * @route GET /api/strength/:strengthId
 * @description get a single strength information (get by id)
 * @access public
 */
strengthRoute.get("/:strengthId", async (req, res) => {
    try {
        const { strengthId } = await req.params
        const isExist = await Strength.findById(strengthId);
        if (!isExist)
            return sendError(res, "StrengthID not exist");
        return sendSuccess(res, "Get strength information successfully.", isExist)
    } catch (error) {
        console.log(error)
        return sendServerError(res);
    }
});

export default strengthRoute