import express from "express"
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import VehicleProfile from "../model/VehicleProfile.js";
import { verifyDriver, verifyToken } from "../middleware/verify.js"
import User from "../model/User.js";

const vehicleProfileRoute = express.Router()

/**
 * @route GET /api/vehicle-profile/
 * @description get about information
 * @access private
 */
vehicleProfileRoute.get('/', verifyToken,
    async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
            const page = req.query.page ? parseInt(req.query.page) : 0
            const { keyword, sortBy, limit, car, vehicle_registration,
                vehicle_type, maintenance_schedule, type_of_fuel } = req.query

            var query = {}
            var keywordList = keyword
                ? {
                    $or: [
                        { car: { $regex: keyword, $options: "i" } },
                        { vehicle_registration: { $regex: keyword, $options: "i" } },
                        { vehicle_type: { $regex: keyword, $options: "i" } },
                        { maintenance_schedule: { $regex: keyword, $options: "i" } },
                        { type_of_fuel: { $regex: keyword, $options: "i" } }
                    ]
                }
                : {}

            if (car) {
                query.car = car
            }
            if (vehicle_registration) {
                query.vehicle_registration = vehicle_registration
            }
            if (vehicle_type) {
                query.vehicle_type = vehicle_type
            }
            if (maintenance_schedule) {
                query.maintenance_schedule = maintenance_schedule
            }
            if (type_of_fuel) {
                query.type_of_fuel = type_of_fuel
            }

            const length = await VehicleProfile.find({ $and: [query, keywordList] }).count()
            const vehicle_profiles = await VehicleProfile.find({ $and: [query, keywordList] })
                .skip(pageSize * page)
                .limit(pageSize)
                .sort(`${sortBy}`)
            if (vehicle_profiles.length == 0) return sendError(res, "Vehicle profile information is not found.")
            return sendSuccess(res, "Get vehicle profile successfully.", { length, vehicle_profiles })
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    });

/**
 * @route GET /api/vehicle-profile/:id
 * @description get about information of vehicle profile by id
 * @access private
 */
vehicleProfileRoute.get('/:id', verifyToken,
    async (req, res) => {
        try {
            const user = await User.findById(req.decoded.userId);
            if (!user) {
                return sendError(res, "User not found", 404);
            }
            const { id } = req.params
            const vehicle_profile = await VehicleProfile.findById(id)
            if (vehicle_profile) return sendSuccess(res, "Get vehicle profile successfully.", vehicle_profile)
            return sendError(res, "Not information found.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    })

export default vehicleProfileRoute