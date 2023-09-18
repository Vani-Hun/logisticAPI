import express, { request } from "express"
import Warehouse from "../../model/Warehouse.js"
import Bill from "../../model/Bill.js"
import { sendError, sendRequest, sendServerError, sendSuccess } from "../../helper/client.js"
import ProductShipment from "../../model/ProductShipment.js"
import { createWarehouseValidate } from "../../validation/warehouse.js"
import opencage from "opencage-api-client"
import { SHIPMENT_MANAGER, OPENCAGE_API_KEY, STAFF } from "../../constant.js"
import { calculateWarehouseTurnover } from "../../service/turnoverWarehouse.js"
import mongoose from "mongoose"
const { Schema } = mongoose
import Staff from "../../model/Staff.js"
const warehouseAdminRoute = express.Router()

/**
 * @route POST /api/admin/warehouse/
 * @description create new warehouse
 * @access private
 */
warehouseAdminRoute.post('/', async (req, res) => {
        const errors = createWarehouseValidate(req.body)
        if (errors)
            return sendError(res, errors)
        const { name, phone, street, ward, district, province, storekeeper } = req.body
        try {
            const isExist = await Warehouse.exists({ name })
            if (isExist) return sendError(res, 'the warehouse\'s name is existed.')
            if (storekeeper != ""){
                const isExistStaff = await Staff.findOne({code: storekeeper}).lean();
                if (!isExistStaff)
                    return sendError(res, "Storekeeper is not exist")
                const warehouse = await Warehouse.create({
                    name, phone, street, ward, district, province, storekeeper
                })
                return sendSuccess(res, 'Create new warehouse successfully.', warehouse)
            }
            const warehouse = await Warehouse.create({
                name, phone, street, ward, district, province
            })
            return sendSuccess(res, 'Create new warehouse successfully.', warehouse)
        }
        catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
 * @route POST /api/admin/warehouse/getStorekeeper
 * @description create new warehouse
 * @access private
 */
warehouseAdminRoute.get('/getStorekeeper', async (req, res) => {
    
    try {
        const staffs = await Staff.find({staff_type: STAFF.STOREKEEPER})
        let arrayStaff = [];
        staffs.forEach((staff) => {
            let info = {
                id: staff.code,
                name: staff.name
            }
            arrayStaff.push(info);
        });
        return sendSuccess(res, 'Get info staff storekeeper successfully.', arrayStaff)
    }
    catch (error) {
        console.log(error)
        return sendServerError(res)
    }
}
)

/**
* @route PUT /api/admin/warehouse/:id
* @description update information of a warehouse
* @access private
*/
warehouseAdminRoute.put('/:id',
    async (req, res) => {
        try {
            const { id } = req.params
            const { name, phone, street, ward, district, province, storekeeper, operating_costs } = req.body
            const isExistStaff = await Staff.findOne({code: storekeeper}).lean();
            if (!isExistStaff)
                return sendError(res, "Storekeeper is not exist")
            const warehouse = await Warehouse.findOne({_id: id}).lean()
            if (warehouse) {
                const isExistName = await Warehouse.findOne({ name: name }).lean()
                if (isExistName){
                    if (isExistName._id.equals(warehouse._id) == false) 
                        return sendError(res, "New name is existed.")
                }
                
                let sum = await Object.values(operating_costs).reduce((a, b) => +a + +b, 0)
                await Warehouse.findByIdAndUpdate(id, { name, phone, street, ward, district, province, storekeeper: isExistStaff._id, operating_costs, total_operating_costs: sum }).lean()
                return sendSuccess(res, "Update warehouse successfully", { name, phone, street, ward, district, province, operating_costs})
            }
            return sendError(res, "This warehouse name is not existed.")
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

/**
* @route PUT /api/admin/add-inventory/:warehouseId
* @description add productshipment to a warehouse
* @access private
*/
warehouseAdminRoute.put('/add-inventory/:warehouseId/', async (req, res) => {
    try {
        let warehouseId = req.params.warehouseId
        let { productShipmentId } = req.body
        
        const productShipment = await ProductShipment.findOne({_id: productShipmentId}).lean()
        if (!productShipment) {
            return sendError(res, "Product shipment does not exist.")
        }
        const warehouse = await Warehouse.findOne({_id: warehouseId}).lean()
        if (!productShipment || !warehouse) return sendError(res, "No information")
        const bills = await Bill.find().lean()
        for (let i = 0; i < bills.length; i++) {
            for (let j = 0; j < bills[i].product_shipments.length; j++) {
                if (bills[i].product_shipments[j].shipment == productShipmentId) {
                    let turnover = bills[i].product_shipments[j].turnover;
                    break;
                }
            }
        }
        let add = { shipment: productShipment, turnover: turnover }
        const totalTurnover = warehouse.turnover + Number(turnover)
        let inventory_product_shipments = [...warehouse.inventory_product_shipments, add]
        await Warehouse.findByIdAndUpdate(warehouseId, { inventory_product_shipments: inventory_product_shipments, turnover: totalTurnover }).lean()
        return sendSuccess(res, "Add product shipment successfully")
    }
    catch (error) {
        console.log(error);
        return sendServerError(res)
    }
})

/**
* @route PUT /api/admin/update-inventory/:warehouseId
* @description export or import productshipment to a warehouse
* @access private
*/
warehouseAdminRoute.put('/update-inventory/:warehouseId', async (req, res) => {
    try {
        const warehouseId = req.params.warehouseId
        const { productShipmentId, status } = req.body
        const productShipment = await ProductShipment.findOne({_id: productShipmentId}).lean()
        if (!productShipment) {
            return sendError(res, "Product shipment does not exist.")
        }
        if (status != 'import' && status != 'export') return sendError(res, "Status must be 'import' or 'export'")
        const warehouse = await Warehouse.findOne({_id: warehouseId}).lean()
        if (!productShipment || !warehouse) return sendError(res, "No information.")
        for (let i = 0; i < warehouse.inventory_product_shipments.length; i++) {
            if (warehouse.inventory_product_shipments[i].shipment == productShipmentId) {
                if (warehouse.inventory_product_shipments[i].status == status) {
                    return sendError(res, "Status already set")
                }
                warehouse.inventory_product_shipments[i].status = status
                warehouse.turnover = warehouse.turnover + (status == 'import' ? +warehouse.inventory_product_shipments[i].turnover : -warehouse.inventory_product_shipments[i].turnover)
                await Warehouse.findByIdAndUpdate(warehouseId, { inventory_product_shipments: warehouse.inventory_product_shipments, turnover: warehouse.turnover }).lean()
                return sendSuccess(res, `${status} successfully`)
            }
        };
        return sendError(res, "This product shipment can not be found in this warehouse.")

    }
    catch (error) {
        console.log(error);
        return sendServerError(res)
    }
})

/**
* @route DELETE /api/admin/warehouse/:id
* @description delete a existing warehouse
* @access private
*/
warehouseAdminRoute.delete('/:id',
    async (req, res) => {
        const { id } = req.params;
        try {
            const isExist = await Warehouse.findOne({_id: id});
            if (!isExist) return sendError(res, "Warehouse does not exist");

            const data = await Warehouse.findByIdAndRemove(id).lean()
            return sendSuccess(res, "Delete warehouse successfully.", data)
        } catch (error) {
            console.log(error)
            return sendServerError(res)
        }
    }
)

export default warehouseAdminRoute