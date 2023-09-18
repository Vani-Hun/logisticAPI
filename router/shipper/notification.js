import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { verifyToken, verifyShipper } from "../../middleware/verify.js"
import { createImageDir } from "../../middleware/createDir.js"
import Order from '../../model/Order.js'
import { ORDER_STATUS, SCAN_TYPE } from '../../constant.js'

const notificationShipperRoute = express.Router()

/**
 * @route GET /api/shipper/notification
 * @description notification for shipper
 * @access public
 */
notificationShipperRoute.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;

        const getOrders = await Order.find({ assign_shipper: staffID, status: "in progress" });
        const deliveryOrders = await Order.find({
            $or: [
                { status: ORDER_STATUS.dispatching },
                { status: ORDER_STATUS.problem_order }
            ]
        });

        const filterOrders = deliveryOrders.filter((order) => {
            if (order.change_shipper && order.change_shipper.accept_transfer === true && order.change_shipper.shipperId) {
                return order.change_shipper.shipperId.toString() === staffID.toString();
            } else if (order.change_shipper && order.change_shipper.accept_transfer === false && order.change_shipper.shipperId) {
                return false;
            } else {
                return order.tracking.some((item) => {
                    return (
                        item.scan_type.toString() === SCAN_TYPE.SHIPPING.toString() &&
                        item.shipper.toString() === staffID.toString()
                    );
                })
            }
        });

        return sendSuccess(res, 'Notification for shipper successfully', {
            GetOrder: getOrders.length,
            DeliveryOrder: filterOrders.length
        });

    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

export default notificationShipperRoute