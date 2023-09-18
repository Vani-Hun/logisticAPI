import express, { query } from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { SCAN_TYPE } from "../../constant.js";
import User from "../../model/User.js";
import Order from "../../model/Order.js";
import { validateDates } from "../../validation/checkDate.js"
const codeScanReportRouter = express.Router();

/**
 * @route GET /shipper/codeScanReport/
 * @description Retrieve the scan code report
 * @access public
 */
codeScanReportRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const { fromDate, toDate } = req.query;
        const validateDate = validateDates(fromDate, toDate);
        if (validateDate != '') {
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
        const details = {
            received_order: 0, //Nhận kiện
            send_orders: 0, //Gửi kiện
            orders_arrive: 0, //Kiện đến
            delivery_order: 0, //phát kiện
            packaging: 0, //Đóng bao
            Issue: 0, // Kiện vấn đề
            car_going: 0, // Xe đi
            car_incoming: 0, //Xe đến
        };
        orders.forEach((order) => {
            for (const item of order.tracking) {
                if (item.scan_type === SCAN_TYPE.RECEIVED_ORDER && item.shipper.toString() === staffId.toString()) {
                    details.received_order++;
                }
            }
            for (const item of order.tracking) {
                if ((item.scan_type.toString() === SCAN_TYPE.SENDING_POSTOFFICE.toString() ||
                    item.scan_type.toString() === SCAN_TYPE.SENDING_WAREHOUSE.toString()) &&
                    item.driver.toString() === staffId.toString()) {
                    details.send_orders++;
                }
            }
            for (const item of order.tracking) {
                if ((item.scan_type.toString() === SCAN_TYPE.INCOMING_POSTOFFICE.toString() ||
                    item.scan_type.toString() === SCAN_TYPE.INCOMING_WAREHOUSE.toString()) &&
                    item.driver.toString() === staffId.toString()) {
                    details.orders_arrive++;
                }
            }
            for (const item of order.tracking) {
                if (item.scan_type.toString() === SCAN_TYPE.SHIPPING.toString() &&
                    item.shipper.toString() === staffId.toString()) {
                    details.delivery_order++;
                }
            }
            for (const item of order.tracking) {
                if (item.scan_type.toString() === SCAN_TYPE.PACKAGING.toString() &&
                    item.shipper.toString() === staffId.toString()) {
                    details.packaging++;
                }
            }
            for (const item of order.tracking) {
                if (item.scan_type === SCAN_TYPE.UNUSUAL_ORDER &&
                    item.shipper.toString() === staffId.toString())
                    details.Issue++;
            }
            for (const item of order.tracking) {
                if (item.scan_type.toString() === SCAN_TYPE.CAR_GOING.toString() &&
                    item.shipper.toString() === staffId.toString())
                    details.car_going++;
            }
            for (const item of order.tracking) {
                if (item.scan_type.toString() === SCAN_TYPE.CAR_INCOMING.toString() &&
                    item.shipper.toString() === staffId.toString())
                    details.car_incoming++;
            }
        });
        return sendSuccess(res, 'Retrieve the successful scan code report', { details });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default codeScanReportRouter;