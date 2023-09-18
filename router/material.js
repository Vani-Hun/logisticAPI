import express from "express"
import Material from "../model/Material.js"
import { sendError, sendSuccess, sendServerError } from "../helper/client.js"

const materialRoute = express.Router()

/**
 * @route GET api/admin/material
 * @description get all material of carFleet
 * @access public
 */
materialRoute.get("/", async(req, res) => {
    try {
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page): 0
        const { keyword, sortBy, staff, car_fleet, warehouse, materials, status } = req.query
        let query = {}
        let keywordList = keyword
            ? {
                $or: [
                    { staff: { $regex: keyword, $options: "i" } },
                    { car_fleet: { $regex: keyword, $options: "i" } },
                    { warehouse: { $regex: keyword, $options: "i" } },
                    { materials: { $regex: keyword, $options: "i" } },
                    { status: { $regex: keyword, $options: "i" } }
                ]
            } : {}
        if(staff){
            query.staff = staff
        }
        if(car_fleet){
            query.car_fleet = car_fleet
        }
        if(warehouse){
            query.warehouse = warehouse
        }
        if(materials){
            query.materials = materials
        }
        if(status){
            query.status = status
        }
        const length = await Material.find({ $and: [query, keywordList] }).count()
        const material = await Material.find({ $and: [query, keywordList] })
            .skip(page * pageSize)
            .limit(pageSize)
            .sort(`${sortBy}`)
        if(material)
            return sendSuccess(res, 'Get material successfully', { length, material })
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
})

/**
 * @route GET api/admin/material/:materialID
 * @description get a material of carfleet by id
 * @access public
 */
materialRoute.get("/:materialID", async(req, res) => {
    try {
        const { materialID } = req.params
        if(!materialID.match(/^[0-9a-fA-F]{24}$/)){
            return sendError(res, 'material id does not existed.')
        }
        const material = await Material.findById({ _id: materialID })
        if(!material) return sendError(res, 'material id does not existed.')
        return sendSuccess(res, 'Get material id successfully', material)
    } catch (error) {
        console.log(error)
        return sendError(res)
    }
})

export default materialRoute