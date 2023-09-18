import express from "express";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import { genaratePostOfficeCode } from "../../service/postOffice.js";
import PostOffice from "../../model/PostOffice.js";
import Order from "../../model/Order.js";
import mongoose from "mongoose"
import { postOfficeValidate } from "../../validation/postOffice.js";
import { getDeliveryTracking, getIncomingTracking, getOrderWithFilters } from "../../service/order.js";
import moment from "moment";
import OrderSeal from "../../model/OrderSeal.js";


const postOfficeAdminRoute = express.Router();


/**
 * @route POST /api/admin/post-office
 * @description create postOffice
 * @access public
 */
postOfficeAdminRoute.post("/", async (req, res) => {
    try {
        const errors = postOfficeValidate(req.body);
        if (errors) return sendError(res, errors);

        const { name, province, district, ward, address } = req.body;

        let code = await genaratePostOfficeCode(province, district);

        if (code == "") {
            return sendError(res, "Failed! Province or district is not valid");
        }

        const postOffice = await PostOffice.create({
            code: code,
            name: name,
            province: province,
            district: district,
            ward: ward,
            address: address,
        });

        return sendSuccess(res, "Add postOffice successfully.", postOffice);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})


/**
 * @route GET /api/admin/post-office
 * @description get postOffice
 * @access public
 */
postOfficeAdminRoute.get("/", async (req, res) => {
    try {
        const { province, district } = req.query
        const postOffices = await PostOffice.aggregate([
            {
                $match: {
                    $and: [
                        province ? { province: province } : {},
                        district ? { district : district } : {}
                    ]
                }
            }
        ])
        if(postOffices.length === 0) return sendError(res, "No post office found")
        return sendSuccess(res, "Add postOffice successfully.", postOffices)
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/post-office/:code
 * @description get postOffice
 * @access public
 */
postOfficeAdminRoute.get("/:code", async (req, res) => {
    try {
        let { code } = req.params
        let postOffices = await PostOffice.find({ code });
        return sendSuccess(res, "Add postOffice successfully.", postOffices);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/post-office/after-fill
 * @description get postOffice after fill 
 * @access public
 */
postOfficeAdminRoute.get("/after-fill", async (req, res) => {
    try {
        let { province, district } = req.body
        let postOffices = await PostOffice.find({ province: province, district: district }).lean()
        return sendSuccess(res, "Add postOffice successfully.", postOffices.code);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/post-office/inventory/:postCode
 * @description get postOffice
 * @access public
 */
postOfficeAdminRoute.get("/inventory/:postCode", async (req, res) => {
    try {
        let { postCode } = req.params
        let postOffice = await PostOffice.findOne({ code: postCode }).lean()
        if (!postOffice) {
            return sendError(res, "Post office not exist")
        }
        let orderLength = await Order.find({ destination: postOffice._id, status: { $in: ["dispatching", "in return"] } }).count().lean()
        let order = await Order.find({ destination: postOffice._id, status: { $in: ["dispatching", "in return"] } }).lean()
        let inventory_weight = 0, inventory_carrying_cost = 0, inventory_COD = 0
        await order.forEach(order => {
            inventory_weight += +order.product.weight,
                inventory_carrying_cost += +order.shipping.total_amount_after_tax_and_discount,
                inventory_COD += +order.cod.cod
        })
        let data = {
            postCode: postCode,
            postName: postOffice.name,
            inventory_number: orderLength,
            inventory_weight: inventory_weight,
            inventory_carrying_cost: inventory_carrying_cost,
            inventory_COD: inventory_COD
        }
        return sendSuccess(res, "Get inventory successfully.", data);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/post-office/inventorydetail/:postCode
 * @description get inventorydetail postOffice
 * @access public
 */
postOfficeAdminRoute.get("/inventorydetail/:postCode", async (req, res) => {
    try {
        let { postCode } = req.params
        let postOffice = await PostOffice.findOne({ code: postCode }).lean()
        if (!postOffice) {
            return sendError(res, "Post office not exist")
        }
        let order = await Order.find({ destination: postOffice._id, status: { $in: ["dispatching", "in return"] } }).populate(
            {
                path: "destination",
                select: "province district address",
            }).lean()
        let data = []
        order.forEach(order => {
            data.push({
                orderId: order.orderId,
                postCode: postCode,
                codFee: order.cod.fee,
                cod: order.cod.cod,
                arrival_time: order.tracking[order.tracking.findIndex((ele) => { return ele.scan_type === "incoming_postoffice" })].scan_code_time,
                delivery_time: order.tracking[order.tracking.findIndex((ele) => { return ele.scan_type === "shipping" })].scan_code_time,
                destination: postCode,
                codeDestination: `${order.destination.address} ${order.destination.district} ${order.destination.province}`,
                weight: order.product.weight
            })
        })
        return sendSuccess(res, "Get inventory successfully.", data);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/post-office/inventory/:startDate/:endDate/:postCode
 * @description get post office supervision 
 * @access public
 */
postOfficeAdminRoute.get("/inventory/:startDate/:endDate/:postCode", async (req, res) => {
    try {
        let { postCode } = req.params
        const startDate = new Date(req.params.startDate)
        const endDate = new Date(req.params.endDate)
        console.log("🚀 ~ postOfficeAdminRoute.get ~ startDate:", startDate)
        console.log("🚀 ~ postOfficeAdminRoute.get ~ startDate:", startDate.toString())
        console.log("🚀 ~ postOfficeAdminRoute.get ~ endDate:", endDate)
        console.log("🚀 ~ postOfficeAdminRoute.get ~ startDate:", endDate.toString())
        let postOffice = await PostOffice.findOne({ code: postCode }).lean()
        if (!postOffice) {
            return sendError(res, "Post office not exist")
        }
        let order_arrivalLength = await Order.find({
            destination: postOffice._id, tracking: {
                $elemMatch: {
                    scan_type: "incoming_postoffice",
                    scan_code_time: { $gte: startDate, $lte: endDate }
                }
            }
        }).count().lean()
        let order_deliveryLength = await Order.find({
            destination: postOffice._id, tracking: {
                $elemMatch: {
                    scan_type: "shipping",
                    scan_code_time: { $gte: startDate, $lte: endDate }
                }
            }
        }).count().lean()
        let data1;
        let data2;
        if (order_deliveryLength === 0 && order_arrivalLength === 0) {
            return sendSuccess(res, "Get inventory successfully", [{
                postCode: postCode,
                arrival_number: 0,
                delivery_number: 0,
                signed_number: 0,
                unsigned_number: 0,
                refund_number: 0,
                delivery_rate: `0%`,
            }, {
                arrival_number: 0,
                delivery_number: 0,
                signed_number: 0,
                unsigned_number: 0,
                refund_number: 0,
                delivery_rate: `0%`,
            }])
        } else if (order_arrivalLength === 0) {
            data1 = {
                postCode: postCode,
                arrival_number: 0,
                delivery_number: 0,
                signed_number: 0,
                unsigned_number: 0,
                refund_number: 0,
                delivery_rate: `0%`,
            }
        } else if (order_deliveryLength === 0) {
            data2 = {
                arrival_number: 0,
                delivery_number: 0,
                signed_number: 0,
                unsigned_number: 0,
                refund_number: 0,
                delivery_rate: `0%`,
            }
        }
        let orderArrival = await Order.find({
            destination: postOffice._id, tracking: {
                $elemMatch: {
                    scan_type: "incoming_postoffice",
                    scan_code_time: { $gte: startDate, $lte: endDate }
                }
            }
        }).lean()
        let orderDelivery = await Order.find({
            destination: postOffice._id, tracking: {
                $elemMatch: {
                    scan_type: "shipping",
                    scan_code_time: { $gte: startDate, $lte: endDate }
                }
            }
        }).lean()
        if (data1 === undefined && data2 === undefined) {
            let signed_number = 0, unsigned_number = 0, refund_number = 0, inventory_number = 0
            await orderArrival.forEach(orderArrival => {
                if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "recived_order") { signed_number++ }
                else if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "shipping") { unsigned_number++ }
                else if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "unusual_order") { refund_number++ }
                else if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "incoming_postoffice") { inventory_number++ }
            })
            let signed_number2 = 0, unsigned_number2 = 0, refund_number2 = 0, inventory_number2 = 0
            await orderDelivery.forEach(orderDelivery => {
                if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "recived_order") { signed_number2++ }
                else if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "shipping") { unsigned_number2++ }
                else if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "unusual_order") { refund_number2++ }
                else if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "incoming_postoffice") { inventory_number2++ }
            })
            let data_arrival = {
                postCode: postCode,
                arrival_number: order_arrivalLength,
                delivery_number: order_arrivalLength - inventory_number,
                signed_number: signed_number,
                unsigned_number: order_arrivalLength - inventory_number - signed_number - refund_number,
                refund_number: refund_number,
                delivery_rate: `${((order_arrivalLength - inventory_number) * 100) / order_arrivalLength}%`,
            }
            let data_delivery = {
                arrival_number: order_deliveryLength,
                delivery_number: order_deliveryLength - inventory_number2,
                signed_number: signed_number2,
                unsigned_number: order_deliveryLength - inventory_number2 - signed_number2 - refund_number2,
                refund_number: refund_number2,
                delivery_rate: `${((order_deliveryLength - inventory_number2) * 100) / order_deliveryLength}%`,
            }
            return sendSuccess(res, "Get inventory successfully.", [data_arrival, data_delivery])
        } else if (data1 === undefined) {
            let signed_number = 0, unsigned_number = 0, refund_number = 0, inventory_number = 0
            await orderArrival.forEach(orderArrival => {
                if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "recived_order") { signed_number++ }
                else if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "shipping") { unsigned_number++ }
                else if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "unusual_order") { refund_number++ }
                else if (orderArrival.tracking[orderArrival.tracking.length - 1].scan_type === "incoming_postoffice") { inventory_number++ }
            })
            let data_arrival = {
                postCode: postCode,
                arrival_number: order_arrivalLength,
                delivery_number: order_arrivalLength - inventory_number,
                signed_number: signed_number,
                unsigned_number: order_arrivalLength - inventory_number - signed_number - refund_number,
                refund_number: refund_number,
                delivery_rate: `${((order_arrivalLength - inventory_number) * 100) / order_arrivalLength}%`,
            }
            return sendSuccess(res, "Get inventory successfully.", [data_arrival, data2])
        }
        else if (data2 === undefined) {
            let signed_number2 = 0, unsigned_number2 = 0, refund_number2 = 0, inventory_number2 = 0
            await orderDelivery.forEach(orderDelivery => {
                if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "recived_order") { signed_number2++ }
                else if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "shipping") { unsigned_number2++ }
                else if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "unusual_order") { refund_number2++ }
                else if (orderDelivery.tracking[orderDelivery.tracking.length - 1].scan_type === "incoming_postoffice") { inventory_number2++ }
            })
            let data_delivery = {
                arrival_number: order_deliveryLength,
                delivery_number: order_deliveryLength - inventory_number2,
                signed_number: signed_number2,
                unsigned_number: order_deliveryLength - inventory_number2 - signed_number2 - refund_number2,
                refund_number: refund_number2,
                delivery_rate: `${((order_deliveryLength - inventory_number2) * 100) / order_deliveryLength}%`,
            }
            return sendSuccess(res, "Get inventory successfully.", [data1, data_delivery])
        }
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route GET /api/admin/post-office/inventorydetail/:startDate/:endDate/:postCode
 * @description get post office supervision 
 * @access public
 */
postOfficeAdminRoute.get("/inventorydetail/:startDate/:endDate/:postCode", async (req, res) => {
    try {
        let { postCode } = req.params
        const startDate = new Date(req.params.startDate)
        const endDate = new Date(req.params.startDate)
        let postOffice = await PostOffice.findOne({ code: postCode }).lean()
        if (!postOffice) {
            return sendError(res, "Post office not exist")
        }
        let orderLength = await Order.find({
            destination: postOffice._id, tracking: {
                $elemMatch: {
                    scan_type: "incoming_postoffice",
                    scan_code_time: { $gte: startDate, $lte: endDate }
                }
            }
        }).count().lean()
        let order = await Order.find({
            destination: postOffice._id, tracking: {
                $elemMatch: {
                    scan_type: "incoming_postoffice",
                    scan_code_time: { $gte: startDate, $lte: endDate }
                }
            }
        }).lean()
        let signed_number = 0, unsigned_number = 0, refund_number = 0, inventory_number = 0
        await order.forEach(order => {
            if (order.tracking[order.tracking.length - 1].scan_type === "recived_order") { signed_number++ }
            else if (order.tracking[order.tracking.length - 1].scan_type === "shipping") { unsigned_number++ }
            else if (order.tracking[order.tracking.length - 1].scan_type === "unusual_order") { refund_number++ }
            else if (order.tracking[order.tracking.length - 1].scan_type === "incoming_postoffice") { inventory_number++ }
        })

        let data = {
            postCode: postCode,
            arrival_number: orderLength,
            delivery_number: orderLength - inventory_number,
            signed_number: signed_number,
            unsigned_number: orderLength - inventory_number - signed_number - refund_number,
            refund_number: refund_number,
            delivery_rate: `${((orderLength - inventory_number) * 100) / orderLength}%`,
        }
        console.log(new Date("2023-07-24"))
        return sendSuccess(res, "Get inventory successfully.", data);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route PATCH /api/admin/post-office/:id
 * @description get postOffice
 * @access public
 */
postOfficeAdminRoute.patch("/:id", async (req, res) => {
    try {
        let { id } = req.params;

        if (mongoose.isValidObjectId(id) == false) {
            return sendError(res, "Failed! Id params is not valid ObjectId");
        }

        const _postOffice = await PostOffice.findById(id);

        if (_postOffice == null || _postOffice == undefined) {
            return sendError(res, "Failed! Post office is not exist");
        }

        const errors = postOfficeValidate(req.body);
        if (errors) return sendError(res, errors);

        const { name, province, district, ward, address } = req.body;

        let code = await genaratePostOfficeCode(province, district);

        if (code == "") {
            return sendError(res, "Failed! Province or district is not valid");
        }

        let postOffice = await PostOffice.findByIdAndUpdate(id, {
            code: code,
            name: name,
            province: province,
            district: district,
            ward: ward,
            address: address,
        });

        return sendSuccess(res, "Update postOffice successfully.", postOffice);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

/**
 * @route DELETE /api/admin/post-office/:id
 * @description delete postOffice
 * @access public
 */
postOfficeAdminRoute.delete("/:id", async (req, res) => {
    try {
        let { id } = req.params;

        if (mongoose.isValidObjectId(id) == false) {
            return sendError(res, "Failed! Id params is not valid ObjectId");
        }

        const _postOffice = await PostOffice.findById(id);

        if (_postOffice == null || _postOffice == undefined) {
            return sendError(res, "Failed! Post office is not exist");
        }

        let postOffice = await PostOffice.findByIdAndRemove(id);
        return sendSuccess(res, "Delete postOffice successfully.", postOffice);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
})

postOfficeAdminRoute.get('/tracking/in-coming', async (req, res) => {
    try {
        const confirmStaffId = req.decoded.roleId
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        let { sortBy, orderIds, previousPostOffice, confirmTime, transportationMode } = req.query
        confirmTime = moment(new Date()).format('YYYY-MM-DD');
        const orders = await getIncomingTracking(pageSize, page, sortBy, orderIds, confirmStaffId, previousPostOffice, confirmTime, transportationMode)
        if(orders.length === 0) return sendError(res, "not found orders")
        return sendSuccess(res, "get incoming tracking: ", orders)
    } catch (error) {
        return sendError(res, error)
    }
})

postOfficeAdminRoute.get('/tracking/delivery', async (req, res) => {
    try {
        const confirmStaffId = req.decoded.roleId
        const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
        const page = req.query.page ? parseInt(req.query.page) : 0
        let { sortBy, orderIds, confirmTime, deliveryStaffId } = req.query
        confirmTime = moment(new Date()).format('YYYY-MM-DD');
        const orders = await getDeliveryTracking(pageSize, page, sortBy, orderIds, confirmStaffId, deliveryStaffId, confirmTime)
        if(orders.length === 0) return sendError(res, "not found orders")
        return sendSuccess(res, "get incoming tracking: ", orders)
    } catch (error) {
        return sendError(res, error)
    }
})

export default postOfficeAdminRoute;
