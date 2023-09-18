import mongoose from "mongoose";
import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import Career from "../model/Career.js";
import { INDUSTRY, PROVINCES, POSITION } from "../constant.js"
const careerRouter = express.Router();
/**
 * @route GET /api/career/isHot
 * @description Get list career isHot
 * @access private
 */
careerRouter.get('/', async (req, res) => {
    try {
        const { applicationPosition, address, industry, position } = req.query;
        const page = parseInt(req.query.page) || 1; // Trang mặc định là 1 nếu không có tham số
        const limit = parseInt(req.query.limit) || 15;
        const searchConditions = {};
        if (applicationPosition) searchConditions.applicationPosition = applicationPosition;
        if (address) searchConditions.address = address;
        if (industry) searchConditions.industry = industry;
        if (position) searchConditions.position = position;
        const totalCareers = await Career.countDocuments(searchConditions);
        const totalPages = Math.ceil(totalCareers / limit);
        const skip = (page - 1) * limit;
        const careers = await Career.find(searchConditions)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (careers.length === 0) {
            return sendError(res, "No career yet.");
        }
        const filteredCareers = careers.filter(career => (
            (!address || career.address === address) &&
            (!industry || career.industry === industry) &&
            (!applicationPosition || career.applicationPosition === applicationPosition) &&
            (!position || career.position === position)
        ));
        const paginationInfo = {
            totalItems: totalCareers,
            totalPages: totalPages,
            currentPage: page
        };
        return sendSuccess(res, "Get career information successfully.", {
            careers: filteredCareers,
            pagination: paginationInfo
        });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

careerRouter.get('/isHot', async (req, res) => {
    try {
        const { applicationPosition, address, industry, position } = req.query;
        const page = parseInt(req.query.page) || 1; // Trang mặc định là 1 nếu không có tham số
        const limit = parseInt(req.query.limit) || 15;
        const searchConditions = {};
        if (applicationPosition) searchConditions.applicationPosition = applicationPosition;
        if (address) searchConditions.address = address;
        if (industry) searchConditions.industry = industry;
        if (position) searchConditions.position = position;
        searchConditions.isHot = true;
        const totalCareers = await Career.countDocuments(searchConditions);
        const totalPages = Math.ceil(totalCareers / limit);
        const skip = (page - 1) * limit;
        const careers = await Career.find(searchConditions)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (careers.length === 0) {
            return sendError(res, "No hot careers yet.");
        }
        const filteredCareers = careers.filter(career => (
            (!address || career.address === address) &&
            (!industry || career.industry === industry) &&
            (!applicationPosition || career.applicationPosition === applicationPosition) &&
            (!position || career.position === position)
        ));
        const paginationInfo = {
            totalItems: totalCareers,
            totalPages: totalPages,
            currentPage: page
        };

        return sendSuccess(res, "Get hot career information successfully.", {
            careers: filteredCareers,
            pagination: paginationInfo
        });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /api/career/isNew
 * @description Get list career isNew
 * @access private
 */
careerRouter.get('/isNew', async (req, res) => {
    try {
        const { applicationPosition, address, industry, position } = req.query;
        const page = parseInt(req.query.page) || 1; // Trang mặc định là 1 nếu không có tham số
        const limit = parseInt(req.query.limit) || 15;
        const searchConditions = {};
        if (applicationPosition) searchConditions.applicationPosition = applicationPosition;
        if (address) searchConditions.address = address;
        if (industry) searchConditions.industry = industry;
        if (position) searchConditions.position = position;
        searchConditions.isNew = true;
        const totalCareers = await Career.countDocuments(searchConditions);
        const totalPages = Math.ceil(totalCareers / limit);
        const skip = (page - 1) * limit;
        const careers = await Career.find(searchConditions)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        if (careers.length === 0) {
            return sendError(res, "No new careers yet.");
        }
        const filteredCareers = careers.filter(career => (
            (!address || career.address === address) &&
            (!industry || career.industry === industry) &&
            (!applicationPosition || career.applicationPosition === applicationPosition) &&
            (!position || career.position === position)
        ));
        const paginationInfo = {
            totalItems: totalCareers,
            totalPages: totalPages,
            currentPage: page
        };
        return sendSuccess(res, "Get new career information successfully.", {
            careers: filteredCareers,
            pagination: paginationInfo
        });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /api/career/detail/:careerId
 * @description Get detail career
 * @access private
 */
careerRouter.get('/detail/:careerId', async (req, res) => {
    try {
        const careerId = req.params.careerId.toString();
        if (!mongoose.Types.ObjectId.isValid(careerId)) {
            return sendError(res, "Invalid careerId.", 400);
        }
        const career = await Career.findById(careerId);
        if (!career) {
            return sendError(res, "No career found.");
        }
        return sendSuccess(res, "Get career detail successful!", career);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /api/career/industry
 * @description Get list industry
 * @access private
 */
careerRouter.get('/industry', async (req, res) => {
    try {
        const industryList = Object.values(INDUSTRY);
        if (industryList.length < 1) return sendError("No list industry yet");
        return sendSuccess(res, "Get list industry successful", industryList);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
/**
 * @route GET /api/career/provinces
 * @description Get list provinces
 * @access private
 */
careerRouter.get('/provinces', async (req, res) => {
    try {
        const provincesList = Object.values(PROVINCES);
        if (provincesList.length < 1) return sendError("No list provinces yet");
        return sendSuccess(res, "Get list provinces successful", provincesList);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
/**
 * @route GET /api/career/position
 * @description Get list position
 * @access private
 */
careerRouter.get('/position', async (req, res) => {
    try {
        const positionList = Object.values(POSITION);
        if (positionList.length < 1) return sendError("No list position yet")
        return sendSuccess(res, "Get list position successful", positionList);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
/**
 * @route GET /api/career/department
 * @description Get list department
 * @access private
 */
careerRouter.get('/department', async (req, res) => {
    try {
        const careers = await Career.find({ isPublished: true });
        const counts = {
            office: {
                CUSTOMERSERVICE: 0,
                ADMINISTRATIVERECEPTIONIST: 0,
                LEGAL: 0,
                ASSISTANT: 0
            },
            business: {
                BUSINESS: 0,
                MARKETING: 0,

            },
            operation: {
                POSTALSERVICES: 0,
                INFORMATIONTECHNOLOGY: 0,
                TRAINING: 0,
                FINANCIALACCOUNTING: 0,
                AUDITING_INTERNALCONTROL: 0,
                QUALITYMANAGEMENT: 0,
                PURCHASING: 0,
                OPERATIONSCENTER: 0,
                OPERATIONS: 0
            },
        };
        for (const career of careers) {
            const industry = career.industry;
            if (INDUSTRY.CUSTOMERSERVICE.includes(industry)) counts.office.CUSTOMERSERVICE++
            if (INDUSTRY.ADMINISTRATIVERECEPTIONIST.includes(industry)) counts.office.ADMINISTRATIVERECEPTIONIST++
            if (INDUSTRY.LEGAL.includes(industry)) counts.office.LEGAL++
            if (INDUSTRY.ASSISTANT.includes(industry)) counts.office.ASSISTANT++

            if (INDUSTRY.BUSINESS.includes(industry)) counts.business.BUSINESS++
            if (INDUSTRY.MARKETING.includes(industry)) counts.business.MARKETING++

            if (INDUSTRY.POSTALSERVICES.includes(industry)) counts.operation.POSTALSERVICES++
            if (INDUSTRY.INFORMATIONTECHNOLOGY.includes(industry)) counts.operation.INFORMATIONTECHNOLOGY++
            if (INDUSTRY.TRAINING.includes(industry)) counts.operation.TRAINING++
            if (INDUSTRY.FINANCIALACCOUNTING.includes(industry)) counts.operation.FINANCIALACCOUNTING++
            if (INDUSTRY.AUDITING_INTERNALCONTROL.includes(industry)) counts.operation.AUDITING_INTERNALCONTROL++
            if (INDUSTRY.QUALITYMANAGEMENT.includes(industry)) counts.operation.QUALITYMANAGEMENT++
            if (INDUSTRY.PURCHASING.includes(industry)) counts.operation.PURCHASING++
            if (INDUSTRY.OPERATIONSCENTER.includes(industry)) counts.operation.OPERATIONSCENTER++
            if (INDUSTRY.OPERATIONS.includes(industry)) counts.operation.OPERATIONS++
        }
        return sendSuccess(res, "Get department information successfully.", counts);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});


export default careerRouter;