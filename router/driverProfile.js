import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import DriverProfile from "../model/DriverProfile.js"
import { verifyDriver, verifyToken } from "../middleware/verify.js"
import User from "../model/User.js"

const driverProfileRoute = express.Router()

/**
 * @route GET /api/driver-profile/
 * @description get about information
 * @access private
 */
driverProfileRoute.get('/', verifyToken,
    async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
            const page = req.query.page ? parseInt(req.query.page) : 0
            const { keyword, sortBy, limit, staff, license, training_certification,
                driving_experience, other_information } = req.query

            var query = {}
            var keywordList = keyword
                ? {
                    $or: [
                        { staff: { $regex: keyword, $options: "i" } },
                        { license: { $regex: keyword, $options: "i" } },
                        { training_certification: { $regex: keyword, $options: "i" } },
                        { driving_experience: { $regex: keyword, $options: "i" } },
                        { other_information: { $regex: keyword, $options: "i" } }
                    ]
                }
                : {}

            if (staff) {
                query.staff = staff
            }
            if (license) {
                query.license = license
            }
            if (training_certification) {
                query.training_certification = training_certification
            }
            if (driving_experience) {
                query.driving_experience = driving_experience
            }
            if (other_information) {
                query.other_information = other_information
            }

            const length = await DriverProfile.find({ $and: [query, keywordList] }).count()
            const driver_profiles = await DriverProfile.find({ $and: [query, keywordList] })
                .skip(pageSize * page)
                .limit(pageSize)
                .sort(`${sortBy}`)
            if (driver_profiles.length == 0) return sendError(res, "Driver profile information is not found.")
            return sendSuccess(res, "Get Driver profile successfully.", { length, driver_profiles })
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    });

/**
 * @route GET /api/driver-profile/:id
 * @description get about information of driver profile by id
 * @access private
 */
driverProfileRoute.get('/:id', verifyToken,
    async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const { id } = req.params
            const driver_profile = await DriverProfile.findById(id)
            if (driver_profile) return sendSuccess(res, "Get driver profile successfully.", driver_profile)
            return sendError(res, "Not information found.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    })

export default driverProfileRoute