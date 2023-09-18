import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js"
import { verifyToken, verifyCustomer } from '../middleware/verify.js'
import Order from "../model/Order.js"
import { ORDER_STATUS } from "../constant.js";

const receiverRoute = express.Router();

receiverRoute.put('/:id',
    verifyToken,
    async (req, res) => {
        const user = await User.findById(req.decoded.userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }
        const id = req.params.id
        const { name, phone, identity } = req.body
        const customerId = user.role
        const order = await Order.findOne({ _id: id, customer: customerId })
        if (!order) { return sendError(res, 'Order not found') }

        if (order.timeline.slice(-1).status === ORDER_STATUS.waiting) {
            try {
                const receiverId = order.receiver
                await Receiver.findByIdAndUpdate(receiverId, { name: name, phone: phone, identity: identity });
                return sendSuccess(res, "Receiver updated successfully");
            }
            catch (err) {
                return sendServerError(res);
            }
        } else {
            return sendError(res, "Cannot update receiver while order is completed");
        }
    })

export default receiverRoute;