import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import individualContract from "../model/IndividualContract.js";
import { verifyToken, verifyCustomer } from '../middleware/verify.js'
import { createPrivateDir } from '../middleware/createDir.js'
import { uploadResources } from '../middleware/storage.js'
import fs from 'fs'
import User from "../model/User.js";
const individualContractRoute = express.Router();


/**
 * @route POST /api/individual-contract
 * @description create individualContract
 * @access public
 */

individualContractRoute.post("/", verifyToken, createPrivateDir,
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
            const { customer, name, phone, area, address, email, id_personal, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo, ID_back_photo, portrait_photo } = req.body
            const isExist = await individualContract.exists({ customer: id })
            if (isExist) {
                await individualContract.findOneAndUpdate({ name, phone, area, address, email, id_personal, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })
            }
            else await individualContract.create({ customer: id, name, phone, area, address, email, id_personal, bank_account_holders, bank_account_number, bank_name, bank_branch, ID_front_photo: file_ID_front_photo, ID_back_photo: file_ID_back_photo, portrait_photo: file_portrait_photo })

            return sendSuccess(res, "Add individual_Contract successfully.")
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    })


/**
 * @route GET /api/individual-contract
 * @description get individualContract by id
 * @access public
 */
individualContractRoute.get("/", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const id = user.role
        const individual_Contract = await individualContract.find({ customer: id });
        if (individual_Contract)
            return sendSuccess(
                res,
                "Get information of individual_Contract successfully.",
                individual_Contract
            );
        return sendError(res, "Information of individual_Contract is not found.");
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
individualContractRoute.delete("/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const { id } = await req.params
        const isExist = await individualContract.findOne({ customer: id })
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
        const individual_Contract = await individualContract.findByIdAndDelete({ _id: id });
        if (individual_Contract)
            return sendSuccess(
                res,
                "Delete information of individual_Contract successfully."
            );
        return sendError(res, "Information of individual_Contract is not found.");
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default individualContractRoute;
