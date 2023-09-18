import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import VehicleProfile from "../../model/VehicleProfile.js"
import Car from "../../model/Car.js"
import { createVehicleProfile } from "../../validation/vehicleProfile.js"

const vehicleProfileAdminRoute = express.Router()

/**
 * @route POST /api/admin/vehicle-profile/create
 * @description create information of vehicle profile
 * @access private
 */
vehicleProfileAdminRoute.post("/create",
async (req, res) => {
    const errors = createVehicleProfile(req.body)
    if (errors) return sendError(res, errors)
    try {
        const { car, vehicle_registration, vehicle_type, year_of_manufacture, 
            manufacturer, mileage, maintenance_schedule, engine_type, 
            cylinder_displacement, power, torque, type_of_fuel, other_information } = req.body

        if (!car.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Car does not exist.")
        }
        const cars = await Car.findById({ _id: car })
        if (!cars) return sendError(res, 'Car does not exist.')

        const vehicle_profiles = await VehicleProfile.create({ 
            car, 
            vehicle_registration, 
            vehicle_type, 
            year_of_manufacture, 
            manufacturer, mileage, 
            maintenance_schedule, 
            engine_type, 
            cylinder_displacement, 
            power, 
            torque, 
            type_of_fuel, 
            other_information 
        })
        return sendSuccess(res, 'Create information of vehicle profiles successfully.', vehicle_profiles)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route PUT /api/admin/driver-profile/:id
 * @description update information of vehicle profile
 * @access private
 */
vehicleProfileAdminRoute.put("/:id",
async (req, res) => {
    try {
        const { id } = req.params
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Id does not exist.")
        }

        const { car, vehicle_registration, vehicle_type, year_of_manufacture, 
                manufacturer, mileage, maintenance_schedule, engine_type, 
                cylinder_displacement, power, torque, type_of_fuel, other_information } = req.body

        if (!car.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Car does not exist.")
        }
        const isExist = await VehicleProfile.exists({ _id: id })
        if(!isExist) return sendError(res, "Vehicle profile does exist.")
        
        const vehicleProfile = await VehicleProfile.findByIdAndUpdate(id, {
            car: car, 
            vehicle_registration: vehicle_registration, 
            vehicle_type: vehicle_type, 
            year_of_manufacture: year_of_manufacture,
            manufacturer: manufacturer,
            mileage: mileage,
            maintenance_schedule: maintenance_schedule,
            engine_type: engine_type,
            cylinder_displacement: cylinder_displacement,
            power: power, 
            torque: torque, 
            type_of_fuel: type_of_fuel, 
            other_information: other_information
        })

        if(vehicleProfile) {
            return sendSuccess(res, "Update vehicle profile successfully.", { 
                _id: id,
                car: car, 
                vehicle_registration: vehicle_registration, 
                vehicle_type: vehicle_type, 
                year_of_manufacture: year_of_manufacture,
                manufacturer: manufacturer,
                mileage: mileage,
                maintenance_schedule: maintenance_schedule,
                engine_type: engine_type,
                cylinder_displacement: cylinder_displacement,
                power: power, 
                torque: torque, 
                type_of_fuel: type_of_fuel, 
                other_information: other_information
             })
        } 
        return sendError(res, "Update vehicle profile failed.")
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route DELETE /api/admin/vehicle-profile/:id
 * @description delete information of vehicle profile
 * @access private
 */
vehicleProfileAdminRoute.delete('/:id',
async (req, res) => {
    try {
        const { id } = req.params
        if(!id.match(/^[0-9a-fA-F]{24}$/)) {
            return sendError(res, "Id does not exist.")
        }

        const isExist = await VehicleProfile.exists({ _id: id })
        if(!isExist) return sendError(res, "Vehicle profile does not exist.")

        const vehicle_profile = await VehicleProfile.findByIdAndDelete(id)
        return sendSuccess(res, "Delete vehicle profile successfully.", vehicle_profile)
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default vehicleProfileAdminRoute