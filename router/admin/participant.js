import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { createParticipantDir } from "../../middleware/createDir.js"
import { uploadImg } from '../../middleware/storage.js'
import { unlinkSync } from 'fs'
import Participant from "../../model/Participant.js"
import DeliveryService from "../../model/DeliveryService.js"
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
const participantAdminRoute = express.Router()

/**
 * @route POST /api/admin/participant/
 * @description create a new participant
 * @access private
 */
participantAdminRoute.post('/', createParticipantDir, uploadImg.single('banner'), async (req, res) => {
    try {
        const { name, name_detail, description } = req.body;
        let file = await `${req.file.destination}${req.file.filename}`
        let namebanner = await req.file.fieldname +
            name_detail
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
        let result = await uploadSingle(file, "participant", namebanner)
        if (result) {
            fs.unlinkSync(file, (err) => {
                console.log(err)
            })
        }
        const participant = await Participant.create({ name, name_detail, banner: result, description });
        return sendSuccess(res, 'Create participant successfully.', participant)
    } catch (error) {
        console.log(error)
        if (req.banner) unlinkSync(req.banner.path)
        return sendServerError(res)
    }
}
)

/**
 * @route PUT /api/admin/participant/:participantId
 * @description update description of a existing participant
 * @access private
 */
participantAdminRoute.put('/:participantId', async (req, res) => {
    try {
        const { participantId } = req.params;
        const { name, name_detail, description } = req.body;
        const participant = await Participant.findById(participantId).lean()
        if (participant) {

            await Participant.findByIdAndUpdate(participantId, { name: name, name_detail: name_detail, description: description })
            return sendSuccess(res, "Update participant successfully.")
        } else { return sendError(res, "Participant does not exist.") }
    } catch (error) {
        console.log(error)
        return sendServerError(res, error)
    }
}
)

/**
 * @route PUT /api/admin/participant/banner/:participantId
 * @description update banner of a existing participant
 * @access private
 */
participantAdminRoute.put('/banner/:participantId', createParticipantDir, uploadImg.single('banner'), async (req, res) => {
    try {
        const { participantId } = req.params;
        const participant = await Participant.findById(participantId);
        if (participant) {
            if (participant.banner) {
                let splitUrl = await participant.banner.split('/')
                console.log("splitUrl:", splitUrl)
                let file = await `${splitUrl[splitUrl.length - 2]}/${splitUrl[splitUrl.length - 1].split('.')[0]}`
                console.log("file:", file)
                await deleteSingle(file)

            }
            let file = await `${req.file.destination}${req.file.filename}`
            let namebanner = await req.file.fieldname + participant.name_detail
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/ /g, '')
            let result = await uploadSingle(file, "participant", namebanner)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
            }
            await Participant.findByIdAndUpdate(participantId, { banner: result })
            return sendSuccess(res, "Update participant successfully.")
        }
        return sendError(res, "Participant does not exist.")
    } catch (error) {
        console.log(error)
        if (req.banner) unlinkSync(req.banner.path)
        return sendServerError(res, error)
    }
}
)

/**
 * @route DELETE /api/admin/participant/:participantId
 * @description delete a existing participant
 * @access private
 */
participantAdminRoute.delete('/:participantId',
    async (req, res) => {
        const { participantId } = req.params
        try {
            const isExist = await Participant.findOne({ _id: participantId })
            if (!isExist) return sendError(res, "Participant does not exist.")
            await DeliveryService.updateOne({}, { $pull: { participants: participantId } })
            let path = isExist.banner.split('/');
            let name = path[path.length - 1].split('.')[0];
            let file = path[path.length - 2] + '/' + name;
            const dataDe = await deleteSingle(file);
            const data = await Participant.findByIdAndRemove(participantId)
            return sendSuccess(res, "Delete participant successfully.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default participantAdminRoute
