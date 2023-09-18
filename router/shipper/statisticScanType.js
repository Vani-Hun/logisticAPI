import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendSuccess, sendError } from "../../helper/client.js";
import Order from "../../model/Order.js";
import { SCAN_TYPE } from "../../constant.js";

import express from "express";

const statisticScanTypeRouter = express.Router();

/**
 * @route GET /api/shipper/statistic-scan-type
 * @description statistic order by scan_type
 */
statisticScanTypeRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    const shipperId = req.decoded.roleId;    

    const cursor = await Order.find({
        tracking: {
            $elemMatch: {
                shipper: shipperId,
                scan_type: {
                    $in: [SCAN_TYPE.RECEIVED_ORDER, SCAN_TYPE.UNUSUAL_ORDER]
                }
            }
        }
    });

    if (cursor.length === 0) {
        return sendError(res, "You do not have any order.")
    }

    let numberOfReceivedOrders = 0;
    let numberOfUnusualOrders = 0;

    cursor.forEach((order) => {
        let { tracking } = order;
        
        tracking.forEach((element) => {
            let {scan_type} = element;
            if (scan_type === SCAN_TYPE.RECEIVED_ORDER) numberOfReceivedOrders++;
            if (scan_type === SCAN_TYPE.UNUSUAL_ORDER) numberOfUnusualOrders++;
        })
    })

    sendSuccess(res, "statistic by scan_type for shipper successfully.", {
        RECEIVED_ORDER: numberOfReceivedOrders,
        UNUSUAL_ORDER: numberOfUnusualOrders
    });
})


export default statisticScanTypeRouter;