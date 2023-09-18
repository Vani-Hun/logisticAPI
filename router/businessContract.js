import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import businessContract from "../model/BusinessContract.js";
import { verifyToken, verifyCustomer } from '../middleware/verify.js'
import { createBusinessDir } from '../middleware/createDir.js'
import { uploadResources } from '../middleware/storage.js'
import User from "../model/User.js";
const businessContractRoute = express.Router();


/**
 * @route POST /api/business-contract
 * @description create businessContract
 * @access public
 */

businessContractRoute.post("/", verifyToken, createBusinessDir,
    uploadResources.fields([{ name: 'ID_front_photo', maxCount: 10 }, { name: 'ID_back_photo', maxCount: 10 }, { name: 'portrait_photo', maxCount: 10 }]), async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const id = user.role
            const file_ID_front_photo = req.files.ID_front_photo[0].path
            const file_ID_back_photo = req.files.ID_back_photo[0].path
            const file_portrait_photo = req.files.portrait_photo[0].path
            const { company_name, name, phone, area, address, email, position, tax_code, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo, ID_back_photo, portrait_photo } = req.body
            const isExist = await businessContract.exists({ customer: id })
            if (isExist) {
                await businessContract.findOneAndUpdate({ company_name, name, phone, area, address, email, position, tax_code, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })
            }
            else await businessContract.create({ customer: id, company_name, name, phone, area, address, email, position, tax_code, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })

            return sendSuccess(res, "Add business_Contract successfully.")
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    })


/**
 * @route GET /api/business-contract
 * @description get businessContract by id
 * @access public
 */
businessContractRoute.get("/", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const id = user.role
        const business_Contract = await businessContract.find({ customer: id });
        if (business_Contract)
            return sendSuccess(
                res,
                "Get information of business_Contract successfully.",
                business_Contract
            );
        return sendError(res, "Information of business_Contract is not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route DELETE /api/business-contract/:id
 * @description delete businessContract by id
 * @access public
 */
businessContractRoute.delete("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const { id } = await req.params
        const business_Contract = await businessContract.findByIdAndDelete({ _id: id });
        if (business_Contract)
            return sendSuccess(
                res,
                "Delete information of business_Contract successfully."
            );
        return sendError(res, "Information of business_Contract is not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default businessContractRoute;
