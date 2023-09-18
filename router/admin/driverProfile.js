import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import DriverProfile from "../../model/DriverProfile.js"
import Staff from "../../model/Staff.js"
import { createDriverProfile } from "../../validation/driverProfile.js"

const driverProfileAdminRoute = express.Router()

/**
 * @route POST /api/admin/driver-profile/create
 * @description create information of driver profile
 * @access private
 */
driverProfileAdminRoute.post("/create", async (req, res) => {
    const errors = createDriverProfile(req.body)
    if (errors) return sendError(res, errors)
    try {
        const { staff, license, training_certification, driving_experience, other_information } = req.body

        if (!staff.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Staff does not exist.")
        }
        const staffs = await Staff.findById({ _id: staff })
        if (!staffs) return sendError(res, "Staff does not exist.")

        const isExistStaff = await Staff.findById({ _id: staff })
        if (isExistStaff) {
            const driver_profiles = await DriverProfile.create({ 
                staff, 
                license, 
                training_certification, 
                driving_experience, 
                other_information 
            })
            return sendSuccess(res, "Create information of driver profile successfully.", driver_profiles)
        }
        return sendError(res, "Create by Staff does not exist.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route PUT /api/admin/driver-profile/:id
 * @description update information of driver profile
 * @access private
 */
driverProfileAdminRoute.put("/:id", async (req, res) => {
    try {
        const { id } = req.params
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Id does not exist.")
        }
        const isExist = await DriverProfile.exists({ _id: id })
        if(!isExist) return sendError(res, "Driver profile does exist.")

        const { license, training_certification, driving_experience, other_information } = req.body
        await DriverProfile.findByIdAndUpdate(id, {
            license: license, 
            training_certification: training_certification, 
            driving_experience: driving_experience, 
            other_information: other_information
        })
        return sendSuccess(res, "Update driver profile successfully.", { 
            license, 
            training_certification, 
            driving_experience, 
            other_information 
        })
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route DELETE /api/driver-profile/:id
 * @description delete information of driver profile
 * @access private
 */
driverProfileAdminRoute.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Id does not exist.")
        }

        const isExist = await DriverProfile.exists({ _id: id })
        if(!isExist) return sendError(res, "Driver profile does not exist.")

        const driver_profile = await DriverProfile.findByIdAndDelete(id)
        return sendSuccess(res, "Delete driver profile successfully.", driver_profile)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})    

export default driverProfileAdminRoute