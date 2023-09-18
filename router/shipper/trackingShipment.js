import express from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import User from "../../model/User.js";
import Order from "../../model/Order.js";
import OrderIssues from "../../model/OrderIssue.js";
import { ORDER_STATUS, SCAN_TYPE, TRANSPORTATION_TYPE } from "../../constant.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
const trackingShipmentRoute = express.Router();


/**
 * @route GET /shipper/tracking-shipment/
 * @description Take out the orders that have not been received by the shipper
 * @access public
 */
trackingShipmentRoute.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const { origin, destination } = req.query
        console.log("")
        const orders = await Order.find({
            $or: [
                { origin: origin},
                { destination: destination}
            ],
            'status': ORDER_STATUS.in_progress
        });
        const issuesOrders = [...new Set(orders.flatMap((order) => {
            const orderId = order.orderId ? order.orderId.toString() : null;
            return orderId;
        }))];

        const orderIssueCounts = {};
        await Promise.all(issuesOrders.map(async (issuesOrderId) => {
            const issuesOrderList = await OrderIssues.find({ orderId: issuesOrderId });
            orderIssueCounts[issuesOrderId] = issuesOrderList.length;
        }));
        const details = orders.map((order) => {
            const phoneNumber = order.receiver.phone;
            const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');
            return {
                orderId: order.orderId,
                name_receiver: order.receiver.name,
                phone_receiver: hiddenPhoneNumber,
                address_receiver: order.receiver.address,
                COD: order.cod.cod,
                name_product: order.product.name,
                reason_for_failed_delivery: orderIssueCounts[order.orderId] || 0,
            };

        });
        if (details.length === 0) {
            return sendError(res, 'No orders yet', 404);
        }
        return sendSuccess(res, 'get list order successfully', { details });
    } catch (error) {
        console.log(error);
        return sendServerError(res)
    }
});


/**
 * @route GET /shipper/tracking-shipment/order/:orderId
 * @description Retrieve order details
 * @access public
 */
trackingShipmentRoute.get('/order/:orderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const id = req.params.orderId;
        const order = await Order.findOne({ orderId: id }).populate([
            {
                path: "shipping",
                select: "discount",
                populate: {
                    path: "discount",
                    select: "rank"
                }
            },
        ]);
        if (!order)
            return sendError(res, 'Get order detail fail');
        let info = {
            orderId: order.orderId,
            sender: order.sender,
            receiver: order.receiver,
            //rank: order.shipping.discount.rank,
            payment_methods: order.product.payment_methods,
            type_shipping: order.shipping.type_shipping,
            type_product: order.product.types,
            transportation: order.tracking[order.tracking.length - 1].transportation,
            name_product: order.product.name,
            weight: order.product.weight,
            value_product: order.product.goods_value,
            other_fee: order.shipping.other,
            insurance_fee: order.shipping.insurance_fees,
            cod: order.cod.cod,
            cod_fee: order.cod.fee
        };
        return sendSuccess(res, 'Get order detail successfully', { info });

    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error');
    }
});
/**
 * @route PATCH /shipper/tracking-shipment/order/:orderId
 * @description Shipper confirmed to take the order
 * @access public
 */

trackingShipmentRoute.patch('/order/:orderId/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const id = req.params.orderId;
        const order = await Order.findOne({ orderId: id });
        if (!order)
            return sendError(res, 'Get order fail');
        if (!order.assign_shipper) {
            const assign_shipper = { $set: { assign_shipper: req.user.id } };
            const updateResult = await Order.updateOne({ orderId: id }, assign_shipper);
            if (updateResult.modifiedCount === 1) {
                return sendSuccess(res, 'Received order successfully');
            } else {
                return sendError(res, 'Error cant accept order');
            }
        }
        return sendError(res, 'The order has been received by another shipper');
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error');
    }
});
export default trackingShipmentRoute;