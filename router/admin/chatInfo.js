import express from 'express'
import { unlinkSync } from 'fs'
import fs from 'fs'
import { uploadImg } from "../../middleware/storage.js"
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
import { createChatInfoDir } from '../../middleware/createDir.js'
import ChatInfo from '../../model/ChatInfo.js'

const chatInfoAdminRoute = express.Router()

/**
* @route GET /api/admin/chat-info
* @description Get information of chat-info
* @access private
*/
chatInfoAdminRoute.get('/', async (req, res) => {
    try {
        const chatInfo = await ChatInfo.findOne({}).populate("rightStrength");
        if (!chatInfo)
            return sendError(res, "Chat info not found");
        return sendSuccess(res, 'Get information successfully.', chatInfo);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/chat-info/leftBanner
* @description create/update chat-info leftBanner
* @access private
*/
chatInfoAdminRoute.post('/leftBanner',
    createChatInfoDir,
    uploadImg.single('leftBanner'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "ChatInfo", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await ChatInfo.findOneAndUpdate({}, { leftBanner: result }, { upsert: true, new: true }).lean()
                return sendSuccess(res, 'Upload leftBanner chat info successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/chat-info/logoChat
* @description create/update chat-info logoChat
* @access private
*/
chatInfoAdminRoute.post('/logoChat',
    createChatInfoDir,
    uploadImg.single('logoChat'),
    async (req, res) => {
        try {
            let file = await `${req.file.destination}${req.file.filename}`
            let name = await req.file.fieldname
            let result = await uploadSingle(file, "ChatInfo", name)
            if (result) {
                fs.unlinkSync(file, (err) => {
                    console.log(err)
                })
                await ChatInfo.findOneAndUpdate({}, { logo_chat: result }, { upsert: true, new: true }).lean()
                return sendSuccess(res, 'Upload logoChat chat info successfully.')
            }
        } catch (error) {
            console.log(error)
            if (req.file) unlinkSync(req.file.path)
            return sendServerError(res)
        }
    }
)

/**
* @route POST /api/admin/chat-info/detailInfo
* @description create/update chat-info detailInfo
* @access private
*/
chatInfoAdminRoute.post('/detailInfo', async (req, res) => {
    const { title, subject, online_service_time, greeting_chat } = req.body
    try {
        await ChatInfo.findOneAndUpdate({}, { title, subject, online_service_time, greeting_chat }, { upsert: true, new: true }).lean()
        return sendSuccess(res, 'Set chat-info information successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/chat-info/rightStrength
* @description create/update chat info rightStrength
* @access private
*/
chatInfoAdminRoute.post('/rightStrength', async (req, res) => {
    const { rightStrength } = req.body
    const splitrightStrength = rightStrength.split(',');
    try {
        await ChatInfo.findOneAndUpdate({}, { rightStrength: splitrightStrength }, { upsert: true, new: true })
        return sendSuccess(res, 'Set right strength chat-info successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/chat-info/suggestChat
* @description create/update chat info suggestChat
* @access private
*/
chatInfoAdminRoute.post('/suggestChat', async (req, res) => {
    const { suggestChat } = req.body
    const splitsuggestChat = suggestChat.split(';');
    try {
        await ChatInfo.findOneAndUpdate({}, { suggest_chat: splitsuggestChat }, { upsert: true, new: true })
        return sendSuccess(res, 'Set suggest chat chat-info successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
* @route POST /api/admin/chat-info/hotChat
* @description create/update chat info hotChat
* @access private
*/
chatInfoAdminRoute.post('/hotChat', async (req, res) => {
    const { hotChat } = req.body
    const splithotChat = hotChat.split(';');
    try {
        await ChatInfo.findOneAndUpdate({}, { hot_chat: splithotChat }, { upsert: true, new: true })
        return sendSuccess(res, 'Set hot chat chat-info successfully.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default chatInfoAdminRoute