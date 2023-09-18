import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Commitment from "../../model/Commitment.js"
import { createCommitmentDir } from "../../middleware/createDir.js"
import { uploadImg } from "../../middleware/storage.js"
import { unlinkSync, unlink } from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import fs from 'fs'
import mongoose from "mongoose"
import SubCommitment from "../../model/SubCommitment.js"

const commitmentAdminRoute = express.Router()

/**
 * @route POST /api/admin/commitment/banner
 * @description create a new commitment
 * @access private
 */
commitmentAdminRoute.post('/banner',
    createCommitmentDir,
    uploadImg.single('banner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "commitment", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await Commitment.findOneAndUpdate({}, { banner: result }, { upsert: true, new: true });
            return sendSuccess(res, 'Create commitment successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route POST /api/admin/commitment/img
 * @description create a new commitment
 * @access private
 */
commitmentAdminRoute.post('/img',
    createCommitmentDir,
    uploadImg.single('img'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "commitment", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await Commitment.findOneAndUpdate({}, { image: result }, { upsert: true, new: true });
            return sendSuccess(res, 'Create commitment successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route POST /api/admin/commitment
 * @description create a new commitment
 * @access private
 */
commitmentAdminRoute.post('/',
    async (req, res) => {
        try {
            const { name } = req.body;
            const commitment = await SubCommitment.findOne({ name: name });
            if (!commitment) { return sendError(res, "commitment does not exist.") }
            await Commitment.findOneAndUpdate({}, { $push: { detail: commitment._id } })
            return sendSuccess(res, 'Set commitment successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE /api/admin/commitment/:subcommitmentId
 * @description remove subcommitment
 * @access private
 */
commitmentAdminRoute.delete("/:subcommitmentId", async (req, res) => {
    try {
        const { subcommitmentId } = req.params
        let commitment = await SubCommitment.findById(subcommitmentId)
        if (!commitment) { return sendError(res, "subcommitment does not exist."); }
        await Commitment.findOneAndUpdate({}, { $pull: { detail: commitment._id } })
        return sendSuccess(res, "Remove subcommitment successfully.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});


export default commitmentAdminRoute
