import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import SocialNetwork from "../model/SocialNetwork.js"
const socialNetworkRoute = express.Router()

/**
 * @route GET /api/participant
 * @description get all socialNetwork
 * @access public
 */
socialNetworkRoute.get('/',
    async (req, res) => {
        try {
            const socialNetwork = await SocialNetwork.find()
            return sendError(res, "OK", socialNetwork)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default socialNetworkRoute