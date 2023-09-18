import express from 'express'
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import ChatInfo from '../model/ChatInfo.js';

const chatInfoRoute = express.Router()

/**
* @route GET /api/chat-info
* @description Get information of chat-info
* @access private
*/
chatInfoRoute.get('/', async (req, res) => {
    try {
        const chatInfo = await ChatInfo.findOne({}).populate("rightStrength");
        if (!chatInfo)
            return sendError(res, "Chat info not found");
        let strengthInfo = [];
        chatInfo.rightStrength.forEach((item) => {
            let strength = {
                name: item.name,
                logo: item.logo,
                link: item.link
            }
            strengthInfo.push(strength);
        });
        let info = {
            title: chatInfo.title,
            subject: chatInfo.subject,
            onlineServiceTime: chatInfo.online_service_time,
            greetingChat: chatInfo.greeting_chat,
            logoChat: chatInfo.logo_chat,
            hotChat: chatInfo.hot_chat,
            suggestChat: chatInfo.suggest_chat,
            leftBanner: chatInfo.leftBanner,
            rightStrength: strengthInfo
        };
        return sendSuccess(res, 'Get information successfully.', info);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default chatInfoRoute