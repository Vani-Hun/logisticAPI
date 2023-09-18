import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import CareerLife from "../model/CareerLife.js"

const careerLifeRoute = express.Router()

/**
 * @route GET /api/career-life
 * @description get career-life information
 * @access public
 */
careerLifeRoute.get('/',
    async (req, res) => {
        try {
            const careerLife = await CareerLife.findOne({}).populate("teammatePortrait")
            if (careerLife)
                return sendSuccess(res, 'get about information successfully.', careerLife)
            return sendError(res, 'about information is not found.')
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    })

export default careerLifeRoute

