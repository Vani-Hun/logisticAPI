import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import Contact from '../../model/Contact.js'
import { createContactDir } from '../../middleware/createDir.js'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import { uploadImg } from "../../middleware/storage.js"
import { unlinkSync } from 'fs'
import fs from 'fs'
import SocialNetwork from '../../model/SocialNetwork.js'
const contactUsAdminRoute = express.Router()

/**
 * @route POST /api/admin/contactus
 * @description create/update contactus info
 * @access private
 */
contactUsAdminRoute.post('/', async (req, res) => {
    try {
        const { address, phone, email, hr_mailbox, android_app, ios_app } = req.body
        await Contact.findOneAndUpdate({}, { address, phone, email, hr_mailbox, android_app, ios_app }, { upsert: true, new: true })
        return sendSuccess(res, 'set contact-us information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
}
)

/**
 * @route POST /api/admin/contactus
 * @description create/update contactus info
 * @access private
 */
contactUsAdminRoute.post('/qr', createContactDir, uploadImg.single('QR_code'), async (req, res) => {
    try {
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname
        let result = await uploadSingle(file, "contact", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        await Contact.findOneAndUpdate({}, { QR_code: result }, { upsert: true, new: true })
        return sendSuccess(res, 'set contact-us information successfully.')
    } catch (error) {
        console.log(error)
        fs.unlinkSync(req.file.path)
        return sendServerError(res)
    }
}
)

/**
 * @route POST /api/admin/contactus
 * @description add social network
 * @access private
 */
contactUsAdminRoute.post('/social-network/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const check = await SocialNetwork.findOne({ _id: id });
        if (!check) { return sendError(res, "SocialNetwork does not exist.") }
        await Contact.findOneAndUpdate({ $push: { social_network: id } })
        return sendSuccess(res, 'Set SocialNetwork successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
}
)

/**
 * @route DELETE /api/admin/contactus
 * @description delete a existing social
 * @access private
 */
contactUsAdminRoute.delete("/social-network/:socialId", async (req, res) => {
    try {
        const { socialId } = req.params
        let socialNetwork = await SocialNetwork.findOne({ _id: socialId })
        if (!socialNetwork) { return sendError(res, "socialNetwork does not exist."); }
        await Contact.updateOne({}, { $pull: { social_network: socialId } })
        return sendSuccess(res, "remove socialNetwork successfully.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route POST /api/admin/contactus
 * @description create/update contactus info
 * @access private
 */
contactUsAdminRoute.post('/top-banner', createContactDir, uploadImg.single('top_banner'), async (req, res) => {
    try {
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname
        let result = await uploadSingle(file, "contact", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        await Contact.findOneAndUpdate({}, { top_banner: result }, { upsert: true, new: true })
        return sendSuccess(res, 'set contact-us information successfully.')
    } catch (error) {
        console.log(error)
        fs.unlinkSync(req.file.path)
        return sendServerError(res)
    }
}
)

/**
 * @route POST /api/admin/contactus
 * @description create/update contactus info
 * @access private
 */
contactUsAdminRoute.post('/bottom-banner', createContactDir, uploadImg.single('bottom_banner'), async (req, res) => {
    try {
        let file = await `${req.file.destination}${req.file.filename}`
        let name = await req.file.fieldname
        let result = await uploadSingle(file, "contact", name)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        await Contact.findOneAndUpdate({}, { bottom_banner: result }, { upsert: true, new: true })
        return sendSuccess(res, 'set contact-us information successfully.')
    } catch (error) {
        console.log(error)
        fs.unlinkSync(req.file.path)
        return sendServerError(res)
    }
}
)
export default contactUsAdminRoute