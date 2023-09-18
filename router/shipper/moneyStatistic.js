import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { verifyToken, verifyShipper } from "../../middleware/verify.js"
import Order from '../../model/Order.js'
import { ORDER_STATUS, SCAN_TYPE } from '../../constant.js'

const moneyStatisticShipperRoute = express.Router()

/**
 * @route GET /api/shipper/money-statistic
 * @description Money Statistic for shipper
 * @access public
 */
moneyStatisticShipperRoute.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;
        const deliveryOrders = await Order.find({ assign_shipper: staffID, status: ORDER_STATUS.dispatching });

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

        let total_goods_value = 0;
        let total_order_value = 0;
        let orders = [];

        await filterOrders.forEach((data) => {
            total_goods_value += +data.product.goods_value;
            total_order_value += +data.shipping.total_amount_after_tax_and_discount;
            let order = { ShippingID: data.shipping.id, shipping_fee: +data.shipping.total_amount_after_tax_and_discount, product_value: +data.product.goods_value };
            orders.push(order);
        });

        return sendSuccess(res, 'Notification for shipper successfully', {
            TotalGoodsValue: total_goods_value,
            TotalOrderValue: total_order_value,
            Order: orders
        });

    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})
/**
 * @route GET /api/shipper/money-statistic/orders/:startOfDay/:endOfDay
 * @description statistic order with shipper
 * @access public
 */
moneyStatisticShipperRoute.get('/orders/:startOfDay/:endOfDay', verifyToken, verifyShipper, async (req, res) => {
    try {
        const shipperId = req.decoded.roleId;
        const startOfDay = new Date(req.params.startOfDay);
        const endOfDay = new Date(req.params.endOfDay + "T23:59:59");
        const receivedOrders = await Order.countDocuments({
            $and: [
                {
                    $or: [
                        {
                            assign_shipper: shipperId,
                            createdAt: { $gte: startOfDay, $lt: endOfDay },
                        }
                    ]
                },
                {
                    $or: [
                        {
                            'change_shipper.shipperId': shipperId,
                            'change_shipper.accept_transfer': true,
                            createdAt: { $gte: startOfDay, $lt: endOfDay },
                        }
                    ]
                }
            ]
        });
        const deliveredOrders = await Order.countDocuments({
            status: ORDER_STATUS.dispatched,
            'tracking.shipper': shipperId,
            updatedAt: { $gte: startOfDay, $lt: endOfDay }
        });
        const createOrders = await Order.countDocuments({
            'tracking.confirm_staff': shipperId,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });
        return sendSuccess(res, "successfully", { received: receivedOrders, delivered: deliveredOrders, createOrder: createOrders })
    } catch (error) {
        return sendServerError(res, 'Error while processing the request.');
    }
})
/**
 * @route GET /api/shipper/money-statistic/delivery-statics
 * @description delivery-statics with shipper
 * @access public
 */
moneyStatisticShipperRoute.get('/delivery-statics', verifyToken, verifyShipper, async (req, res) => {
    const shipperId = req.decoded.roleId
    try {
        const dispatchedOrders = await Order.find({
            'deliverySign.shipper': shipperId,
            status: ORDER_STATUS.dispatched,
        }).select('orderId');

        const dispatchingOrders = await Order.find({
            'change_shipper.shipperId': shipperId,
            status: ORDER_STATUS.dispatching,
        }).select('orderId');

        const result = {
            dispatched: dispatchedOrders.map(order => order.orderId),
            dispatching: dispatchingOrders.map(order => order.orderId)
        };
        if (result.dispatched.length === 0 && result.dispatching.length === 0) {
            return sendError(res, "order not found", 404)
        }
        return sendSuccess(res, 'successfully', result);
    } catch (error) {
        console.error(error);
        return sendServerError(res);
    }
});

export default moneyStatisticShipperRoute