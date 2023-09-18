import express from "express";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import businessContract from "../../model/BusinessContract.js"
import { createBusinessDir } from "../../middleware/createDir.js"
import { verifyCustomer } from "../../middleware/verify.js"
import { uploadResources } from '../../middleware/storage.js'
import fs from 'fs'
const businessContractAdminRoute = express.Router();


/**
 * @route POST /api/admin/business-contract/id
 * @description create businessContract
 * @access public
 */

businessContractAdminRoute.post("/:customerId", createBusinessDir, uploadResources.fields([{ name: 'ID_front_photo', maxCount: 10 }, { name: 'ID_back_photo', maxCount: 10 }, { name: 'portrait_photo', maxCount: 10 }]), async (req, res) => {
    try {
        const { customerId } = await req.params
        const file_ID_front_photo = req.files.ID_front_photo[0].path
        const file_ID_back_photo = req.files.ID_back_photo[0].path
        const file_portrait_photo = req.files.portrait_photo[0].path
        const { company_name, name, phone, area, address, email, position, tax_code, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo, ID_back_photo, portrait_photo } = req.body
        const isExist = await businessContract.exists({ customer: customerId })
        if (isExist) {
            await businessContract.findOneAndUpdate({ company_name, name, phone, area, address, email, position, tax_code, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })
        }
        else await businessContract.create({ customer: customerId, company_name, name, phone, area, address, email, position, tax_code, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })
        return sendSuccess(res, "Add businessContract successfully.")
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/business-contract
 * @description get all individual contract
 * @access public
 */
businessContractAdminRoute.get("/", async (req, res) => {
    try {
        const business_Contract = await businessContract.find({})
        if (business_Contract)
            return sendSuccess(res, "Get businessContract successfully.", business_Contract);
        return sendError(res, "Information not found.");
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
businessContractAdminRoute.delete("/:customerId", async (req, res) => {
    try {
        const { customerId } = await req.params
        const isExist = await businessContract.findOne({ customer: customerId })
        if (isExist) {
            fs.unlink(isExist.ID_front_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.ID_back_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
            fs.unlink(isExist.portrait_photo, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        }
        const business_Contract = await businessContract.findOneAndDelete({ customer: customerId });
        if (business_Contract)
            return sendSuccess(
                res,
                "Delete information of businessContract successfully."
            );
        return sendError(res, "Information of businessContract is not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default businessContractAdminRoute;
