import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import SubCommitment from "../../model/SubCommitment.js"
import { createCommitmentDir } from "../../middleware/createDir.js"
import { uploadImg } from "../../middleware/storage.js"
import { unlinkSync, unlink } from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import fs from 'fs'
import mongoose from "mongoose"
import Commitment from "../../model/Commitment.js"

const subCommitmentAdminRoute = express.Router()


/**
 * @route GET /api/subcommitment
 * @description get all commitments
 * @access public
 */
subCommitmentAdminRoute.get('/',
    async (req, res) => {
        try {
            const commits = await SubCommitment.find()
            if (commits) return sendSuccess(res, "Get commitment successfully.", commits)
            return sendError(res, "Not information found.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route POST /api/admin/sub-commitment
 * @description create a new commitment
 * @access private
 */
subCommitmentAdminRoute.post('/', createCommitmentDir,
    uploadImg.single('logo'),
    async (req, res) => {
        try {
            const { name, description } = await req.body
            const commitment = await SubCommitment.findOne({ name: name })
            if (commitment) { return sendError(res, "name exist") }
            let file = await `${req.file.destination}${req.file.filename}`
            let nameLogo = await req.file.fieldname + name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
            let result = await uploadSingle(file, "commitment", nameLogo)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await SubCommitment.create({ name: name, description: description, logo: result })
            return sendSuccess(res, 'Create commitment successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route PUT /api/admin/sub-commitment/logo/:subcommitmentId
 * @description update commitment
 * @access private
 */
subCommitmentAdminRoute.put('/logo/:subcommitmentId', createCommitmentDir,
    uploadImg.single('logo'),
    async (req, res) => {
        try {
            const { subcommitmentId } = await req.params
            const commitment = await SubCommitment.findById(subcommitmentId)
            if (!commitment) { return sendError(res, "not found") }
            if (commitment.logo) {
                let splitUrl = await commitment.logo.split('/')
                let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                await deleteSingle(file)
            }
            let file = await `${req.file.destination}${req.file.filename}`
            let nameLogo = await req.file.fieldname + commitment.name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
            let result = await uploadSingle(file, "commitment", nameLogo)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await SubCommitment.findByIdAndUpdate(subcommitmentId, { logo: result })
            return sendSuccess(res, 'Create commitment successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route PUT /api/admin/sub-commitment/:subcommitmentId
 * @description update commitment
 * @access private
 */
subCommitmentAdminRoute.put('/:subcommitmentId',
    async (req, res) => {
        try {
            const { name, description } = await req.body
            const { subcommitmentId } = await req.params
            const commitment = await SubCommitment.findById(subcommitmentId)
            if (!commitment) { return sendError(res, "not found") }
            await SubCommitment.findByIdAndUpdate(subcommitmentId, { name: name, description: description })
            return sendSuccess(res, 'update commitment successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE /api/admin/sub-commitment/:subcommitmentId
 * @description delete a existing sub-commitment
 * @access private
 */
subCommitmentAdminRoute.delete('/:subcommitmentId',
    async (req, res) => {
        try {
            const { subcommitmentId } = await req.params
            const commitment = await SubCommitment.findById(subcommitmentId)
            if (!commitment) { return sendError(res, "not found") }
            await Commitment.updateOne({}, { $pull: { detail: subcommitmentId } })
            let path = commitment.logo.split('/');
            let name = path[path.length - 1].split('.')[0];
            let file = path[path.length - 2] + '/' + name;
            const dataDe = await deleteSingle(file);
            const data = await SubCommitment.findByIdAndRemove(subcommitmentId)
            return sendSuccess(res, "Delete sub-commitment successfully.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default subCommitmentAdminRoute