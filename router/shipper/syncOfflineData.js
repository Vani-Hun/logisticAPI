import { verifyShipper, verifyToken } from "../../middleware/verify.js";
import { sendSuccess, sendError } from "../../helper/client.js";
import Order from "../../model/Order.js";
import { COD_STATUS, SCAN_TYPE, ORDER_STATUS, TRANSPORTATION_TYPE } from "../../constant.js";
import User from "../../model/User.js";
import Staff from "../../model/Staff.js";

import express from "express";

const syncOfflineDataRouter = express.Router();

syncOfflineDataRouter.post('/', verifyToken, verifyShipper, async (req, res) => {
    const user = await User.findById(req.decoded.userId);
    const staffId = user.role;
    const role = await Staff.findById(staffId)
    if (!role.staff_type === 'shipper') return sendError(res, "You are not a shipper");

    const body = req.body;

    if (body.type === 'SIGN_ORDER') {
        const order = await Order.findOne({ orderId: body.data["order_id"]});
        if (!order) {
            return sendError(res, "Cannot find order");
        }

        const isOrderBelongsToShipper = (order.change_shipper && 
            order.change_shipper.accept_transfer === true && order.change_shipper.shipperId &&
            order.change_shipper.shipperId.toString() === staffId.toString()) ||
            (order.change_shipper && order.change_shipper.accept_transfer === false && 
                order.change_shipper.shipperId &&
                order.change_shipper.shipperId.toString() === staffId.toString()
                ) ||
            order.tracking.some((item) => {
                return (
                    item.scan_type.toString() === SCAN_TYPE.SHIPPING.toString() &&
                    item.shipper.toString() === staffId.toString()
                );
            });

        if (!isOrderBelongsToShipper) {
            return sendError(res, "You are not the shipper of this order.");
        }

        const newTracking = {
            scan_type: SCAN_TYPE.RECEIVED_ORDER,
            shipper: staffId.toString(),
            scan_code_time: body.data["scan_code_time"] || new Date().toISOString(),
            transportation: body.data["transportation"] || TRANSPORTATION_TYPE.MOTORBIKE
        };

        await Order.updateOne({ orderId: body.data["order_id"] }, {
            $push: { tracking: newTracking },
            status: ORDER_STATUS.dispatched,
        }, { new: true });

    } else {
        return sendError(res, "Invalid Type")
    }

   sendSuccess(res, "sync offline data successfully.")
})

export default  syncOfflineDataRouter;