import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import SocialNetwork from '../../model/SocialNetwork.js'
import { createSocialNetworkDir } from '../../middleware/createDir.js'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import { uploadImg } from "../../middleware/storage.js"
import { unlinkSync } from 'fs'
import fs from 'fs'
import Contact from '../../model/Contact.js'
const socialNetworkAdminRoute = express.Router()

/**
 * @route POST /api/admin/social-network
 * @description create/update SocialNetworkus info
 * @access private
 */
socialNetworkAdminRoute.post('/', createSocialNetworkDir, uploadImg.single('logo'), async (req, res) => {
    try {
        const { name, link } = req.body
        let file = await `${req.file.destination}${req.file.filename}`
        let nameLogo = await req.file.fieldname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '')
        let result = await uploadSingle(file, "socialNetwork", nameLogo)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        await SocialNetwork.create({ name, link, logo: result })
        return sendSuccess(res, 'set SocialNetwork-us information successfully.')
    } catch (error) {
        console.log(error)
        fs.unlinkSync(req.file.path)
        return sendServerError(res)
    }
}
)

/**
 * @route PUT /api/admin/social-network
 * @description update social network
 * @access private
 */
socialNetworkAdminRoute.put('/:socialId', async (req, res) => {
    try {
        const { socialId } = req.params;
        const check = await SocialNetwork.findOne({ _id: socialId }).lean()
        if (!check) { return sendError(res, "SocialNetwork does not exist.") }
        const { name, link } = await req.body
        await SocialNetwork.findOneAndUpdate({ _id: socialId }, { name: name, link: link })
        return sendSuccess(res, 'Update SocialNetwork successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
}
)

/**
 * @route PUT /api/admin/social-network
 * @description update social network
 * @access private
 */
socialNetworkAdminRoute.put('/logo/:socialId', createSocialNetworkDir, uploadImg.single('logo'), async (req, res) => {
    try {
        const { socialId } = await req.params;
        const isExist = await SocialNetwork.findOne({ _id: socialId }).lean()
        if (isExist) {
            if (isExist.logo) {
                let splitUrl = await isExist.logo.split('/')
                let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                await deleteSingle(file)
            }
        }
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D')
            .replace(/ /g, '')
        let result = await uploadSingle(file, "SocialNetwork", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        await SocialNetwork.findOneAndUpdate({ _id: socialId }, { logo: result })
        return sendSuccess(res, 'set SocialNetwork information successfully.')
    } catch (error) {
        console.log(error)
        fs.unlinkSync(req.file.path)
        return sendServerError(res)
    }
}
)

/**
 * @route DELETE /api/admin/social-network
 * @description delete social network
 * @access private
 */
socialNetworkAdminRoute.delete('/delete/:socialId',
    async (req, res) => {
        const { socialId } = req.params
        try {
            const isExist = await SocialNetwork.findOne({ _id: socialId }).lean()
            if (!isExist) return sendError(res, "SocialNetwork does not exist.")
            await Contact.updateOne({}, { $pull: { social_network: socialId } })
            let path = isExist.banner.split('/');
            let name = path[path.length - 1].split('.')[0];
            let file = path[path.length - 2] + '/' + name;
            await deleteSingle(file);
            await SocialNetwork.findByIdAndRemove(socialId)
            return sendSuccess(res, "Delete SocialNetwork successfully.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)
export default socialNetworkAdminRoute