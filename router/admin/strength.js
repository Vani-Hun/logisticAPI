import express from 'express'
import { unlinkSync } from 'fs'
import fs from 'fs'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import { createStrengthDir } from '../../middleware/createDir.js'
import { uploadImg } from '../../middleware/storage.js'
import Strength from '../../model/Strength.js'
import About from '../../model/About.js'

const strengthAdminRoute = express.Router()

/**
* @route POST /api/admin/strength/create
* @description update strength logo by id
* @access private
*/
strengthAdminRoute.post('/create',
    createStrengthDir,
    uploadImg.single('logo'),
    async (req, res) => {
        try {
            const { name, sub_name, detail, description, link } = req.body
            let fileLogo = await `${req.file.destination}${req.file.filename}`
            let nameLogo = await req.file.fieldname + name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
            let resultLogo = await uploadSingle(fileLogo, "strength", nameLogo)
            if (resultLogo) {
                fs.unlinkSync(fileLogo, (err) => {
                    console.log(err)
                })
            }
            await Strength.create({ name, sub_name, detail, description, link, logo: resultLogo });
            return sendSuccess(res, 'Create strength successfully.')
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route PUT /api/admin/strength/logo/{strengthId}
* @description update strength logo by id
* @access private
*/
strengthAdminRoute.put('/logo/:strengthId',
    createStrengthDir,
    uploadImg.single('logo'),
    async (req, res) => {
        try {
            const id = await req.params.strengthId;
            const isExist = await Strength.findById(id);
            if (!isExist) {
                return sendError(res, "StrengthID not exist");
            }
            if (isExist.logo) {
                let splitUrl = await isExist.logo.split('/')
                let fileDel = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                await deleteSingle(fileDel)
            }
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.filename + isExist.name.normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
            let result = await uploadSingle(file, "strength", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await Strength.findByIdAndUpdate(id, { logo: result })
            return sendSuccess(res, 'update logo successfully.')
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route PUT /api/admin/strength/detail/{strengthId}
* @description update strength info by id
* @access private
*/
strengthAdminRoute.put('/detail/:strengthId',
    async (req, res) => {
        try {
            const { name, sub_name, detail, description, link, isPublicHomePage, isPublicAboutUs } = req.body
            const id = await req.params.strengthId;
            const isExist = await Strength.findById(id);
            if (!isExist)
                return sendError(res, "StrengthID not exist");
            await Strength.findByIdAndUpdate(id, { name, sub_name, detail, description, link, isPublicHomePage, isPublicAboutUs })
            return sendSuccess(res, 'update information successfully.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route DELETE api/admin/strength/:strengthId
 * @description delete a strength by id
 * @access private
 */
strengthAdminRoute.delete("/:strengthId", async (req, res) => {
    try {
        const { strengthId } = req.params
        if (!strengthId.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, 'Strength ID does not existed.')
        }
        const strength = await Strength.findById({ _id: strengthId })
        if (!strength) return sendError(res, 'Blog ID does not existed.')
        if (strength) {
            let splitUrl = await strength.logo.split('/')
            let fileDel = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
            await deleteSingle(fileDel)
            await About.findOneAndUpdate({}, { $pull: { strengths: strengthId } })
            await Strength.findByIdAndDelete({ _id: strengthId })
            return sendSuccess(res, 'Delete strength successfully.')
        }
        return sendError(res, 'Delete strength failed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default strengthAdminRoute