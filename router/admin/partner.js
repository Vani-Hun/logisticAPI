import express from "express"
import Partner from "../../model/Partner.js"
import { createPartnerUsDir } from "../../middleware/createDir.js"
import { uploadImg } from "../../middleware/storage.js"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { unlinkSync } from "fs"
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"

const partnerAdminRoute = express.Router()

/**
 * @route POST /api/admin/partner
 * @description create new partner 
 * @access private
 */
partnerAdminRoute.post('/', createPartnerUsDir, uploadImg.single('logo'),
    async (req, res) => {
        try {
            const { name } = req.body
            if (!name) return sendError(res, "Name is required")
            if (!req.file) return sendError(res, "Logo is required")
            const isExist = await Partner.exists({ name })
            if (isExist) {
                return sendError(res, "This partner name is already existed.")
            }
            let file = await `${req.file.destination}${req.file.filename}`
            let nameLogo = await req.file.fieldname + name.replace(/ /g, '')
            let result = await uploadSingle(file, "partner", nameLogo)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await Partner.create({ name: name, logo: result })
            return sendSuccess(res, "Create partner successfully", name)
        } catch (err) {
            fs.unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
 * @route PUT /api/admin/partner/:id
 * @description update information of a partner
 * @access private
 */
partnerAdminRoute.put('/:id',
    createPartnerUsDir,
    uploadImg.single('logo'),
    async (req, res) => {
        try {
            const { id } = req.params
            const { name } = req.body
            if (!name) return sendError(res, "Name is required")
            const isExist = await Partner.findById(id)
            if (!isExist) return sendError(res, "This partner is not existed.")
            let file = await `${req.file.destination}${req.file.filename}`
            let nameLogo = await req.file.fieldname + isExist.name
            let result = await uploadSingle(file, "partner", nameLogo)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await Partner.findByIdAndUpdate(id, { name: name, logo: result })
            return sendSuccess(res, "Update partner successfully")

        } catch (error) {
            console.log(error)
            fs.unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE /api/admin/partner/:id
 * @description delete a existing partner
 * @access private
 */
partnerAdminRoute.delete('/:id',
    async (req, res) => {
        const { id } = req.params;
        try {
            const isExist = await Partner.findById(id);
            if (!isExist) return sendError(res, "Partner not exist");
            let path = isExist.logo.split('/');
            let name = path[path.length - 1].split('.')[0];
            let file = path[path.length - 2] + '/' + name;
            const dataDe = await deleteSingle(file);
            const data = await Partner.findByIdAndRemove(id)
            return sendSuccess(res, "Delete partner successfully.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default partnerAdminRoute
