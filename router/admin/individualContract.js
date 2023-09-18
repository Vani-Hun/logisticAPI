import express from "express";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import individualContract from "../../model/IndividualContract.js"
import { verifyCustomer } from "../../middleware/verify.js"
import { createPrivateDir } from "../../middleware/createDir.js"
import { uploadResources } from '../../middleware/storage.js'
import fs from 'fs'
const individualContractAdminRoute = express.Router();


/**
 * @route POST /api/admin/individual-contract/id
 * @description create individualContract
 * @access public
 */

individualContractAdminRoute.post("/:customerId", createPrivateDir, uploadResources.fields([{ name: 'ID_front_photo', maxCount: 10 }, { name: 'ID_back_photo', maxCount: 10 }, { name: 'portrait_photo', maxCount: 10 }]), async (req, res) => {
    try {

        const { customerId } = await req.params
        const file_ID_front_photo = req.files.ID_front_photo[0].path
        const file_ID_back_photo = req.files.ID_back_photo[0].path
        const file_portrait_photo = req.files.portrait_photo[0].path
        const { name, phone, area, address, email, id_personal, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo, ID_back_photo, portrait_photo } = req.body
        const isExist = await individualContract.exists({ customer: customerId })
        if (isExist) {
            await individualContract.findOneAndUpdate({ name, phone, area, address, email, id_personal, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })
        }
        else await individualContract.create({ customer: customerId, name, phone, area, address, email, id_personal, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })
        return sendSuccess(res, "Add individual_Contract successfully.")
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/individual-contract
 * @description get all individual contract
 * @access public
 */
individualContractAdminRoute.get("/", async (req, res) => {
    try {
        const individual_Contract = await individualContract.find({})
        if (individual_Contract)
            return sendSuccess(res, "Get individualContract successfully.", individual_Contract);
        return sendError(res, "Information not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route DELETE /api/individual-contract/:id
 * @description delete individualContract by id
 * @access public
 */
individualContractAdminRoute.delete("/:customerId", async (req, res) => {
    try {
        const { customerId } = await req.params
        const isExist = await individualContract.findOne({ customer: customerId })
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
        const individual_Contract = await individualContract.findOneAndDelete({ customer: customerId });
        if (individual_Contract)
            return sendSuccess(res, "Delete information of individual_Contract successfully.");
        return sendError(res, "Information of individual_Contract is not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default individualContractAdminRoute;
