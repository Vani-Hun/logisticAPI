import express from "express";
import { sendSuccess, sendError, sendServerError } from "../../helper/client.js";
import Material from "../../model/Material.js";
import { createMaterialValidate } from "../../validation/material.js";
import Staff from "../../model/Staff.js";
import CarFleet from "../../model/CarFleet.js";
import Warehouse from "../../model/Warehouse.js";

const materialAdminRoute = express.Router()

/**
 * @route POST api/admin/material
 * @description create new material
 * @access private
 */
materialAdminRoute.post("/", async(req, res) => {
    try {
        const error = createMaterialValidate(req.body)
        if(error) return sendError(res, error)
        let { staff, car_fleet, warehouse, materials, status, description } = req.body
        if(!staff || !staff.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'Staff ID does not exist.')
        }
        if(!car_fleet || !car_fleet.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'CarFleet does not exist.')
        }
        if(!warehouse || !warehouse.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res,'Warehouse ID does not exist.')
        }
        const staffID = await Staff.findById({_id: staff})
        if(!staffID) return sendError(res, 'Staff ID does not exists.')
        const carFleetID = await CarFleet.findById({_id: car_fleet})
        if(!carFleetID) return sendError(res, 'CarFleet ID does not exist.')
        const warehouseID = await Warehouse.findById({_id: warehouse})
        if(!warehouseID) return sendError(res, 'Warehouse does not exist.')
        const materialsTotalPrice = materials.reduce((acc, curr) => {
            return acc + curr.price
        }, 0)
        const material = await Material.create({
            staff: staff,
            car_fleet: car_fleet,
            warehouse: warehouse,
            materials: materials,
            total_price: materialsTotalPrice,
            status: status,
            description: description  
        })
        if(material){
            return sendSuccess(res, 'Create new material successfully.', material)
        }
        return sendError(res, 'Create new material failed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route PUT api/admin/material/:materialID
 * @description update a material of carfleet by id
 * @access private
 */
materialAdminRoute.put("/:materialID", async(req, res) => {
    try {
        const { materialID } = req.params
        const { staff, car_fleet, warehouse, materials, status, description } = req.body

        const errors = createMaterialValidate(req.body)

        if(errors) return sendError(res, errors)

        if(!staff && !car_fleet && !warehouse && !materials && !status && !description){
            return sendError(res, 'Please enter the files that need updating.')
        }

        const staffID = await Staff.findOne({_id: staff})
        if(!staffID) return sendError(res, 'Staff IDD does not exist.')
        
        const carFleetID = await CarFleet.findOne({_id: car_fleet})
        if(!carFleetID) return sendError(res, 'CarFleet IDD does not exist.')

        const warehouseID = await Warehouse.findOne({_id: warehouse})
        if(!warehouseID) return sendError(res, 'Warehouse ID does not exist.')
                
        const materialsTotalPrice = materials.reduce((acc, curr) => {
            return acc + curr.price
        }, 0)

        const material = await Material.findByIdAndUpdate(materialID, {
            staff: staff,
            car_fleet: car_fleet,
            warehouse: warehouse,
            materials: materials,
            total_price: materialsTotalPrice,
            status: status,
            description: description
        })

        if(material){
            return sendSuccess(res, 'Update material successfully.', {
                _id: materialID,
                staff: staff,
                car_fleet: car_fleet,
                warehouse: warehouse,
                materials: materials,
                total_price: materialsTotalPrice,
                status: status,
                description: description
            })
        }

        return sendError(res, 'Update material failed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route DELETE api/admin/material/:materialID
 * @description delete a material of carfleet by id
 * @access private
 */
materialAdminRoute.delete("/:materialID", async(req, res) => {
    try {
        const { materialID } = req.params
        const material = await Material.findByIdAndDelete({_id: materialID})
        if(material){
            return sendSuccess(res, 'Delete material successfully.', material)
        }
        return sendError(res, 'Material ID does not existed.')
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

export default materialAdminRoute
