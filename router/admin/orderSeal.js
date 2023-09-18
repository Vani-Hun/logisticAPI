import express from "express";
import OrderSeal from "../../model/OrderSeal.js";
import { genarateSealCode } from "../../service/orderSeal.js";
import { verifyToken } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { createOrderSealValidate } from "../../validation/orderSeal.js";
import { checkOrdersInCreateSealOrder, updateInPlanForOrders, handleClearOrderIds, checkOrdersInUpdateSealOrder, } from "../../service/orderSeal.js";
import Warehouse from "../../model/Warehouse.js";
import mongoose from "mongoose";

const orderSealRoute = express.Router();

/**
 * @route GET /api/admin/orderSeal/:id
 * @description get 1 order seal 
 * @access private
 */
orderSealRoute.get("/:id",
    async (req, res) => {
        try {
            let { id } = req.params;

            if (id == null || id == undefined) {
                return sendError(res, "id in params is required");
            }
            else {
                if (mongoose.isValidObjectId(id) == false) {
                    return sendError(res, `id - ${id} is not a valid objectId mongoose`);
                }
            }

            const orderSeal = await OrderSeal
                .findById(id);

            if (orderSeal == null || orderSeal == undefined) {
                return sendError(res, "orderSeal is not exist");
            }

            return sendSuccess(res, 'success', orderSeal);
        } catch (error) {
            console.log(error.message);
            return sendServerError(res);
        }
    });

/**
 * @route DELETE /api/admin/orderSeal/:id
 * @description delete 1 order seal 
 * @access private
 */
orderSealRoute.delete("/:id", 
    async (req, res) => {
        try {
            let { id } = req.params;

            if (id == null || id == undefined) {
                return sendError(res, "id in params is required");
            }
            else {
                if (mongoose.isValidObjectId(id) == false) {
                    return sendError(res, `id - ${id} is not a valid objectId mongoose`);
                }
            }

            const orderSeal = await OrderSeal
                .findById(id);

            if (orderSeal == null || orderSeal == undefined) {
                return sendError(res, "orderSeal is not exist");
            }

            await OrderSeal.findByIdAndDelete(id);

            return sendSuccess(res, 'success', orderSeal);
        } catch (error) {
            console.log(error.message);
            return sendServerError(res);
        }
    });

/**
 * @route PUT /api/admin/orderSeal/:id
 * @description update 1 order seal 
 * @access private
 */
orderSealRoute.put("/:id", 
    async (req, res) => {
        try {
            let { id } = req.params;

            if (id == null || id == undefined) {
                return sendError(res, "id in params is required");
            }
            else {
                if (mongoose.isValidObjectId(id) == false) {
                    return sendError(res, `id - ${id} is not a valid objectId mongoose`);
                }
            }

            let orderSeal = await OrderSeal
                .findById(id);

            if (orderSeal == null || orderSeal == undefined) {
                return sendError(res, "orderSeal is not exist");
            }

            const staffId = req.decoded.roleId;
            let { warehouse, orderIds } = req.body;
            const errors = createOrderSealValidate(req.body);
            if (errors) return sendError(res, errors);
            orderIds = orderIds.split(' ');
            const _warehouse = await Warehouse.findById(warehouse);

            if (_warehouse == null || _warehouse == undefined)
                return sendError(res, 'warehouse is not exit');

            const _orderIds = orderIds.map((value) => { return { "orderId": value } })
            const error = await checkOrdersInUpdateSealOrder(
                orderSeal.orders,
                _orderIds,
                warehouse);

            if (error != null && error != undefined) {
                return sendError(res, error);
            }
            const old_orderIds = orderSeal.orders;
            await handleClearOrderIds(old_orderIds);

            orderSeal.warehouse = warehouse;
            orderSeal.staffConfirm = staffId;
            orderSeal.orders = _orderIds;
            await orderSeal.save();

            await updateInPlanForOrders(_orderIds);

            return sendSuccess(res, 'success', orderSeal);
        } catch (error) {
            console.log(error.message);
            return sendServerError(res);
        }
    });

/**
 * @route POST /api/admin/orderSeal
 * @description create order seal
 * @access private
 */
orderSealRoute.post("/", 
    async (req, res) => {
        try {
            const staffId = req.decoded.roleId;
            let { warehouse, orderIds } = req.body;
            const errors = createOrderSealValidate(req.body);
            if (errors) return sendError(res, errors);
            orderIds = orderIds.split(' ');
            const _warehouse = await Warehouse.findById(warehouse);

            if (_warehouse == null || _warehouse == undefined)
                return sendError(res, 'warehouse is not exit');

            const _orderIds = orderIds.map((value) => { return { "orderId": value } })
            const error = await checkOrdersInCreateSealOrder(_orderIds, warehouse);

            if (error != null && error != undefined) {
                return sendError(res, error);
            }

            let orderSeal = await OrderSeal.create({
                code: genarateSealCode(),
                warehouse: warehouse,
                staffConfirm: staffId,
                orders: _orderIds,
            })

            await updateInPlanForOrders(_orderIds);

            return sendSuccess(res, 'success', orderSeal);
        } catch (error) {
            console.log(error.message);
            return sendServerError(res);
        }
    });

/**
 * @route GET /api/admin/orderSeal
 * @description get order seal list
 * @access private
 */
orderSealRoute.get("/",
    async (req, res) => {
        try {
            let { searchKey, page, pageSize, warehouse, isUsed } = req.query;

            let conditions = [];
            if (searchKey != null && searchKey != undefined) {
                conditions.push({
                    code: {
                        $regex: searchKey,
                        $options: "i",
                    }
                });
            }
            if (warehouse != null && warehouse != undefined) {
                if (mongoose.isValidObjectId(warehouse) == false) {
                    return sendError(res, `warehouse - ${warehouse} is not a valid objiectId mongoose`)
                }
                conditions.push({
                    warehouse: warehouse,
                });
            }
            if (isUsed != null && isUsed != undefined) {
                conditions.push({
                    isUsed: isUsed,
                });
            }

            let skipNum = (Number(page) - 1) * pageSize;
            if (skipNum < 0) skipNum = 0;
            let filter = {
                $and: conditions
            }
            if (conditions.length == 0) filter = {};

            const orderSeals = await OrderSeal
                .find(filter)
                .skip(skipNum)
                .limit(Number(pageSize))

            return sendSuccess(res, 'success', orderSeals, orderSeals.length);
        } catch (error) {
            console.log(error.message);
            return sendServerError(res);
        }
    });

export default orderSealRoute;