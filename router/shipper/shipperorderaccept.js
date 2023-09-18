import express, { query } from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { SCAN_TYPE } from "../../constant.js";
import User from "../../model/User.js";
import Order from "../../model/Order.js";
import { validateDates } from "../../validation/checkDate.js"
const shipperorderacceptRouter = express.Router();

/**
 * @route PUT /shipper/acceptOrder/:orderId
 * @description Mark an order as accepted by the shipper
 * @access public
 */
shipperorderacceptRouter.put('/acceptOrder/:orderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const user = await User.findById(req.user.id);
        
        if (!user) return sendError(res, "User not found", 404);
        
        // Tìm đơn hàng theo orderId và kiểm tra xem nó có thể nhận được hay không
        const order = await Order.findOne({
            _id: orderId,
            $or: [
                { status: ORDER_STATUS.dispatching },
                { status: ORDER_STATUS.problem_order }
            ]
        });

        if (!order) return sendError(res, "Order not found or cannot be accepted", 404);

        // Kiểm tra xem người dùng hiện tại có quyền nhận đơn không (dựa vào vai trò)
        const staffId = user.role;
        
        // Kiểm tra xem đơn hàng có thể nhận được bởi người dùng hiện tại không
        if (!canAcceptOrder(order, staffId)) {
            return sendError(res, "Cannot accept this order", 403);
        }

        // Cập nhật trạng thái của đơn hàng thành "đã nhận"
        order.status = ORDER_STATUS.accepted;
        await order.save();

        return sendSuccess(res, 'Order accepted successfully');
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

// Hàm kiểm tra xem đơn hàng có thể nhận bởi tài xế cụ thể không
function canAcceptOrder(order, staffId) {
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
        });
    }
}

export default shipperorderacceptRouter;
