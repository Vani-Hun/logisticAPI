import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import Order from "../../model/Order.js";

import express from "express";

const searchOrdersRouter = express.Router();

/**
 * @route GET /api/shipper/search-order
 * @description search order by scan_code_time
 */
searchOrdersRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    const shipperId = req.decoded.roleId;

    const startTime = req.query.startTimeFilter || -1;
    const endTime = req.query.endTimeFilter || -1;

    if (startTime < 0 || endTime < 0) {
        return sendError(res, "Invalid time filter");
    }

    const startTimeFilter = new Date(startTime);
    const endTimeFilter = new Date(endTime);
    endTimeFilter.setUTCHours(24, 0, 0, -1);

    if (startTimeFilter.toString() === "Invalid Date" || endTimeFilter.toString() === "Invalid Date") {
        return sendError(res, "Cannot parse time filter");
    }

    const cursor = await Order.find({
        tracking: {
            $elemMatch: {
                shipper: shipperId,
                scan_type: 'shipping',
                scan_code_time: { $gte: startTimeFilter, $lte: endTimeFilter }
            }
        }
    });

    if (cursor.length === 0) {
        return sendError(res, "There is not any order in this period time.")
    }

    const result = [];

    cursor.forEach((order) => {
        // get scan_code_time
        let { tracking } = order;

        let list = tracking.filter((ele) => ele.scan_type === "shipping");

        result.push({
            orderID: order.orderId,
            scan_code_time: list[0].scan_code_time,
            total_amount_after_tax_and_discount: order.shipping.total_amount_after_tax_and_discount
        });
    })

    return sendSuccess(res, "get order by scan_code_time successfully.", result, result.length);
});

export default searchOrdersRouter;