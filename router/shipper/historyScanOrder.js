import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { verifyToken, verifyShipper } from "../../middleware/verify.js"
import mongoose from "mongoose"
import Order from '../../model/Order.js'
import { SCAN_TYPE } from '../../constant.js'

const historyScanOrderShipperRoute = express.Router()

/**
 * @route GET /api/shipper/historyScanOrder
 * @description show history-scan-order
 * @access public
 */
historyScanOrderShipperRoute.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;
        const orders = await Order.find({ "tracking.shipper": staffID });
        let recived_order = { count: 0, status: [], order_id: [] };
        let sending_postoffice = { count: 0, status: [], order_id: [] };
        let incoming_postoffice = { count: 0, status: [], order_id: [] };
        let sending_warehouse = { count: 0, status: [], order_id: [] };
        let incoming_warehouse = { count: 0, status: [], order_id: [] };
        let shipping = { count: 0, status: [], order_id: [] };
        let unusual_order = { count: 0, status: [], order_id: [] };
        await orders.forEach((data) => {
            data.tracking.forEach((info) => {
                if (info.scan_type === SCAN_TYPE.RECIVED_ORDER) {
                    if (recived_order.status.indexOf(info.scan_type) === -1 && recived_order.order_id.indexOf(data.orderId) === -1 || recived_order.status.indexOf(info.scan_type) != -1 && recived_order.order_id.indexOf(data.orderId) === -1) {
                        recived_order.count++;
                        recived_order.status.push(info.scan_type);
                        recived_order.order_id.push(data.orderId);
                    }
                }
                if (info.scan_type === SCAN_TYPE.SENDING_POSTOFFICE) {
                    if (sending_postoffice.status.indexOf(info.scan_type) === -1 && sending_postoffice.order_id.indexOf(data.orderId) === -1 || sending_postoffice.status.indexOf(info.scan_type) != -1 && sending_postoffice.order_id.indexOf(data.orderId) === -1) {
                        sending_postoffice.count++;
                        sending_postoffice.status.push(info.scan_type);
                        sending_postoffice.order_id.push(data.orderId);
                    }
                }
                if (info.scan_type === SCAN_TYPE.INCOMING_POSTOFFICE) {
                    if (incoming_postoffice.status.indexOf(info.scan_type) === -1 && incoming_postoffice.order_id.indexOf(data.orderId) === -1 || incoming_postoffice.status.indexOf(info.scan_type) != -1 && incoming_postoffice.order_id.indexOf(data.orderId) === -1) {
                        incoming_postoffice.count++;
                        incoming_postoffice.status.push(info.scan_type);
                        incoming_postoffice.order_id.push(data.orderId);
                    }
                }
                if (info.scan_type === SCAN_TYPE.SENDING_WAREHOUSE) {
                    if (sending_warehouse.status.indexOf(info.scan_type) === -1 && sending_warehouse.order_id.indexOf(data.orderId) === -1 || sending_warehouse.status.indexOf(info.scan_type) != -1 && sending_warehouse.order_id.indexOf(data.orderId) === -1) {
                        sending_warehouse.count++;
                        sending_warehouse.status.push(info.scan_type);
                        sending_warehouse.order_id.push(data.orderId);
                    }
                }
                if (info.scan_type === SCAN_TYPE.INCOMING_WAREHOUSE) {
                    if (incoming_warehouse.status.indexOf(info.scan_type) === -1 && incoming_warehouse.order_id.indexOf(data.orderId) === -1 || incoming_warehouse.status.indexOf(info.scan_type) != -1 && incoming_warehouse.order_id.indexOf(data.orderId) === -1) {
                        incoming_warehouse.count++;
                        incoming_warehouse.status.push(info.scan_type);
                        incoming_warehouse.order_id.push(data.orderId);
                    }
                }
                if (info.scan_type === SCAN_TYPE.SHIPPING) {
                    if (shipping.status.indexOf(info.scan_type) === -1 && shipping.order_id.indexOf(data.orderId) === -1 || shipping.status.indexOf(info.scan_type) != -1 && shipping.order_id.indexOf(data.orderId) === -1) {
                        shipping.count++;
                        shipping.status.push(info.scan_type);
                        shipping.order_id.push(data.orderId);
                    }
                }
                if (info.scan_type === SCAN_TYPE.UNUSUAL_ORDER) {
                    if (unusual_order.status.indexOf(info.scan_type) === -1 && unusual_order.order_id.indexOf(data.orderId) === -1 || unusual_order.status.indexOf(info.scan_type) != -1 && unusual_order.order_id.indexOf(data.orderId) === -1) {
                        unusual_order.count++;
                        unusual_order.status.push(info.scan_type);
                        unusual_order.order_id.push(data.orderId);
                    }
                }

            });
        });
        return sendSuccess(res, 'History scan order successfully', {
            recived_order: recived_order.count,
            sending_postoffice: sending_postoffice.count,
            incoming_postoffice: incoming_postoffice.count,
            sending_warehouse: sending_warehouse.count,
            incoming_warehouse: incoming_warehouse.count,
            shipping: shipping.count,
            unusual_order: unusual_order.count
        });
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route GET /api/shipper/historyScanOrder/detail
 * @description show history scan order detail
 * @access public
 */
historyScanOrderShipperRoute.get('/detail', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;
        let type = ['recived_order', 'sending_postoffice', 'incoming_postoffice', 'sending_warehouse', 'incoming_warehouse', 'shipping', 'unusual_order'];
        const typeScan = req.body.typeScan;
        if (type.indexOf(typeScan) === -1)
            return sendError(res, "Type Scan not match");
        const orders = await Order.find({ "tracking.shipper": staffID, "tracking.scan_type": typeScan });
        let info = [];
        orders.forEach((data) => {
            const phone = data.receiver.phone;
            const hiddenPhone = phone.substring(phone.length - 4).padStart(phone.length, '*');
            let timeScan = [];
            data.tracking.forEach((item) => {
                if (item.scan_type === typeScan)
                    timeScan.push(item.scan_code_time);
            });
            let order = {
                orderId: data.orderId,
                name_receiver: data.receiver.name,
                phone_receiver: hiddenPhone,
                address_receiver: data.receiver.address,
                name_product: data.product.name,
                time: timeScan
            };
            info.push(order);
        });
        return sendSuccess(res, 'History order successfully', {
            Count: orders.length,
            Order: info
        });
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

export default historyScanOrderShipperRoute