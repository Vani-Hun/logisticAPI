import express from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import User from "../../model/User.js";
import Order from "../../model/Order.js";
import { SCAN_TYPE } from "../../constant.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { validateDates } from "../../validation/checkDate.js";
import { formatPercentage } from "../../helper/formatPercentage.js"
const deliveryRateRouter = express.Router();

/**
 * @route GET /shipper/deliveryRate/
 * @description Get the delivery rate
 * @access public
 */
deliveryRateRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const { fromDate, toDate } = req.query;
        const validateDate = validateDates(fromDate, toDate);
        if (validateDate !== '') {
            return sendError(res, validateDate);
        }
        const query = {};
        if (fromDate && toDate) {
            query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        }
        const orders = await Order.find(query);
        if (orders.length === 0) {
            return sendError(res, "No orders yet");
        }
        const filterOrders = orders.filter((order) => {
            if (order.change_shipper && order.change_shipper.accept_transfer === true && order.change_shipper.shipperId) {
                return order.change_shipper.shipperId.toString() === staffId.toString();
            } else if (order.change_shipper && order.change_shipper.accept_transfer === false && order.change_shipper.shipperId) {
                return false;
            } else {
                return order.tracking.some((item) => {
                    return (
                        item.scan_type.toString() === SCAN_TYPE.SHIPPING.toString() &&
                        item.shipper.toString() === staffId.toString()
                    );
                })
            }
        });
        let receivedOrderCount = 0;
        let unusualOrderCount = 0;
        let warehouseCount = 0;
        let totalOrders = 0;

        filterOrders.forEach((order) => {
            order.tracking.forEach((item) => {
                switch (item.scan_type) {
                    case SCAN_TYPE.RECEIVED_ORDER:
                        receivedOrderCount++;
                        break;
                    case SCAN_TYPE.UNUSUAL_ORDER:
                        unusualOrderCount++;
                        break;
                    case SCAN_TYPE.WAREHOUSE:
                    case SCAN_TYPE.CAR_GOING:
                    case SCAN_TYPE.CAR_INCOMING:
                        warehouseCount++;
                        break;
                }
            });
            totalOrders++;
        });
        const completionRate = (totalOrders === 0) ? "0%" : formatPercentage((receivedOrderCount / totalOrders) * 100);
        const returnRate = (totalOrders === 0) ? "0%" : formatPercentage((unusualOrderCount / totalOrders) * 100);
        const storageRate = (totalOrders === 0) ? "0%" : formatPercentage((warehouseCount / totalOrders) * 100);
        return sendSuccess(res,"Get the delivery rate, success" ,{
            completionRate,
            returnRate,
            storageRate
        });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default deliveryRateRouter;
