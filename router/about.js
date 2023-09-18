import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import About from "../model/About.js"
import client from "../helper/connectRedis.js"
const aboutRoute = express.Router()

/**
 * @route GET /api/about
 * @description get about information
 * @access public
 */
aboutRoute.get('/',
    async (req, res) => {
        try {
            const about = await About.findOne({})
            if (about)
                return sendSuccess(res, 'get about information successfully.', about)
            return sendError(res, 'about information is not found.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    })

/**
 * @route GET /api/about/getSearchBanner
 * @description get search banner
 * @access public
 */
aboutRoute.get('/getSearchBanner', async (req, res) => {
    try {
        const about = await About.findOne({})
        if (about)
            return sendSuccess(res, 'get search banner successfully.', about.searchBanner)
        return sendError(res, 'search banner is not found.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default aboutRoute

