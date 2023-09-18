import express, { query } from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { ORDER_STATUS, SCAN_TYPE, TRANSPORTATION_TYPE } from "../../constant.js";
import Order from "../../model/Order.js";
import User from "../../model/User.js";
import moment from 'moment';
import { validateDates } from "../../validation/checkDate.js"
const CODSigningStatusRouter = express.Router();


/**
 * @route GET /shipper/CODSigningStatus/
 * @description Get the number of unsigned and signed applications by date
 * @access public
 */

CODSigningStatusRouter.get('/', verifyToken, async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const { fromDate, toDate, isSign } = req.query;
        const validateDate = validateDates(fromDate, toDate);
        if (validateDate != '') {
            return sendError(res, validateDate);
        }
        const query = {
            $or: [
                { status: ORDER_STATUS.dispatching },
                { status: ORDER_STATUS.dispatched },
                { status: ORDER_STATUS.problem_order }
            ]
        };

        if (isSign === 'true') {
            query['sign.signed_to_receive'] = true;
        } else if (isSign === 'false') {
            query['sign.signed_to_receive'] = { $exists: false }
        }
        if (fromDate && toDate) {
            query.createdAt = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        }

        const orders = await Order.find(query);

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
                });
            }
        });
        if (filterOrders.length === 0) {
            return sendError(res, 'No orders yet', 404);
        }
        const orderCounts = {};
        filterOrders.forEach((order) => {
            const date = moment(order.createdAt).format('YYYY-MM-DD');
            const COD = parseInt(order.cod.cod) + parseInt(order.cod.fee) + parseInt(order.shipping.total_amount_after_tax_and_discount);
            if (!orderCounts[date]) {
                orderCounts[date] = {
                    Quantity: 0,
                    sumCOD: 0
                }
            }
            orderCounts[date].Quantity++;
            orderCounts[date].sumCOD += COD;
        });
        return sendSuccess(res, 'Get the number of unsigned and signed applications by date', { orderCounts });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /shipper/CODSigningStatus/list-order
 * @description Get the shipper's order list for the selected date
 * @access public
 */

CODSigningStatusRouter.get('/details-of-the-day', verifyToken, async (req, res) => {
    try {
        const { date, isSign } = req.query;
        const staffId = req.decoded.roleId;
        const query = {};

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.createdAt = { $gte: startDate, $lt: endDate };
        }

        if (isSign === 'true') {
            query['sign.signed_to_receive'] = true;
        } else if (isSign === 'false') {
            query['sign.signed_to_receive'] = { $exists: false };
        }

        const orders = await Order.find(query);
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
                });
            }
        });

        const details = filterOrders.map((order) => {
            const phoneNumber = order.receiver.phone;
            const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');
            return {
                orderId: order.orderId,
                name_receiver: order.receiver.name,
                phone_receiver: hiddenPhoneNumber,
                address_receiver: order.receiver.address,
                COD: order.cod.cod,
                name_product: order.product.name,
            };
        });
        if (details.length === 0) {
            return sendError(res, "Order not found", 404);
        }
        return sendSuccess(res, 'Get the shippers order list for the selected date successfully', { details });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});


/**
 * @route GET /shipper/CODSigningStatus/list-order
 * @description detail of order
 * @access public
 */

CODSigningStatusRouter.get('/detail-order/:orderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const staffId = req.decoded.roleId;
        const order = await Order.findOne({ orderId: orderId });

        if (!order) {
            return sendError(res, 'Order not found');
        }
        const isOrderBelongsToShipper = (order.change_shipper && order.change_shipper.accept_transfer === true && order.change_shipper.shipperId &&
            order.change_shipper.shipperId.toString() === staffId.toString()) ||
            (order.change_shipper && order.change_shipper.accept_transfer === false && order.change_shipper.shipperId &&
                order.change_shipper.shipperId.toString() === staffId.toString()) ||
            order.tracking.some((item) => {
                return (
                    item.scan_type.toString() === SCAN_TYPE.SHIPPING.toString() &&
                    item.shipper.toString() === staffId.toString()
                );
            });

        if (isOrderBelongsToShipper) {
            const phoneNumber = order.receiver.phone;
            const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');
            const details = {
                orderId: order.orderId,
                name_receiver: order.receiver.name,
                phone_receiver: hiddenPhoneNumber,
                address_receiver: order.receiver.address,
                COD: order.cod.cod,
                name_product: order.product.name,
            }
            return sendSuccess(res, 'detail of order successfully', { details });
        } else {
            return sendError(res, "You are not authorized to access this order", 403);
        }

    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default CODSigningStatusRouter;