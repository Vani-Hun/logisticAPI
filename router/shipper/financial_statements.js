import express from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { ORDER_STATUS, SCAN_TYPE, TRANSPORTATION_TYPE } from "../../constant.js";
import Order from "../../model/Order.js";
import User from "../../model/User.js";
import { validateDates } from "../../validation/checkDate.js"
const financial_statementsRouter = express.Router();

financial_statementsRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const { fromDate, toDate } = req.query;
        const validateDate = validateDates(fromDate, toDate);
        if (validateDate != '') {
            return sendError(res, validateDate);
        }
        const query = {
            status: ORDER_STATUS.dispatched
        };
        const orders = await Order.find(query);
        const filterOrders = orders.filter((order) => {
            if (order.change_shipper && order.change_shipper.accept_transfer === true && order.change_shipper.shipperId) {
                return order.tracking.some(item => {
                    const scanCodeTime = new Date(item.scan_code_time);
                    return (
                        item.scan_type.toString() === SCAN_TYPE.RECEIVED_ORDER &&
                        order.change_shipper.shipperId.toString() === staffId.toString() &&
                        scanCodeTime >= new Date(fromDate) &&
                        scanCodeTime <= new Date(toDate)
                    );
                });
            } else if (order.change_shipper && order.change_shipper.accept_transfer === false && order.change_shipper.shipperId) {
                return false;
            } else {
                return order.tracking.some((item) => {
                    const scanCodeTime = new Date(item.scan_code_time);
                    return (
                        item.scan_type.toString() === SCAN_TYPE.RECEIVED_ORDER.toString() &&
                        item.shipper.toString() === staffId.toString() &&
                        scanCodeTime >= new Date(fromDate) &&
                        scanCodeTime <= new Date(toDate)
                    );
                })
            }
        });
        const orderCounts = {
            Receiving_fee: 0,
            Freight_receiving_fee: 0,
            COD: 0,
        };
        filterOrders.forEach((order) => {
            const Receiving_fee = parseInt(order.shipping.receiver_fee);
            const Freight_receiving_fee = parseInt(order.shipping.total_amount_after_tax_and_discount);
            const COD = parseInt(order.cod.cod) + parseInt(order.cod.fee);
            orderCounts.Receiving_fee += Receiving_fee;
            orderCounts.Freight_receiving_fee += Freight_receiving_fee;
            orderCounts.COD += COD;
        })

        return sendSuccess(res, "Retrieve financial statements successfully", orderCounts);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default financial_statementsRouter;