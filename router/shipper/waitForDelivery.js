import express from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import User from "../../model/User.js";
import Order from "../../model/Order.js";
import OrderIssues from "../../model/OrderIssue.js";
import { ORDER_STATUS, SCAN_TYPE, TRANSPORTATION_TYPE } from "../../constant.js";
import { uploadResourcesOrderIssueImage, uploadImage } from "../../middleware/storage.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import moment from 'moment';
import { createOrderIssuesValidate } from "../../validation/orderIssues.js";
import { signTheOrder, changeShipperOrder } from "../../validation/order.js";
import { createOrderIssueDir, createSignatureDir, createAppSignatureDir } from '../../middleware/createDir.js';
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"
const waitForDeliveryRouter = express.Router();

/**
 * @route GET /shipper/waitForDelivery/
 * @description Get the shipper's list of orders to be delivered
 * @access public
 */

waitForDeliveryRouter.get('/', verifyToken, verifyShipper, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        if (!user) return sendError(res, "User not found", 404);
        const staffId = req.decoded.roleId;
        const orders = await Order.find({
            $or: [
                { status: ORDER_STATUS.dispatching },
                { status: ORDER_STATUS.problem_order }
            ]
        });

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
                })
            }
        });

        const issuesOrders = [...new Set(filterOrders.flatMap((order) => {
            const orderId = order.orderId ? order.orderId.toString() : null;
            return orderId;
        }))];

        const orderIssueCounts = {};
        await Promise.all(issuesOrders.map(async (issuesOrderId) => {
            const issuesOrderList = await OrderIssues.find({ orderId: issuesOrderId });
            orderIssueCounts[issuesOrderId] = issuesOrderList.length;
        }));
        const details = filterOrders.map((order) => {
            const phoneNumber = order.receiver.phone;
            const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');

            const shippingEvent = order.tracking.find((item) => item.scan_type === SCAN_TYPE.SHIPPING);
            let estimatedDeliveryTime = 'N/A';
            let time_remaining = 'N/A';
            if (shippingEvent) {
                const scanCodeTime = moment(shippingEvent.scan_code_time, 'ddd MMM DD YYYY HH:mm:ss');
                const estimatedDelivery = scanCodeTime.add(12, 'hours');

                if (estimatedDelivery.isValid()) {
                    estimatedDeliveryTime = estimatedDelivery.format('YYYY-MM-DD HH:mm');
                    const currentTime = moment(); // Thời điểm hiện tại
                    if (estimatedDelivery < currentTime) {
                        const remainingTime = moment.duration(estimatedDelivery.diff(currentTime)); // Tính thời gian còn lại
                        const remainingDays = remainingTime.days();
                        const remainingHours = remainingTime.hours();
                        time_remaining = `Đã quá thời gian dự kiến (${remainingDays} ngày ${remainingHours} giờ)`;
                    } else {
                        const remainingTime = moment.duration(currentTime.diff(estimatedDelivery)); // Tính thời gian còn lại
                        const remainingMinutes = Math.abs(remainingTime.minutes()).toString().padStart(2, '0');
                        const remainingHours = Math.abs(remainingTime.hours()).toString().padStart(2, '0');
                        const remainingSeconds = Math.abs(remainingTime.seconds()).toString().padStart(2, '0');
                        time_remaining = `Cần giao trước thời gian dự kiến (${remainingHours}:${remainingMinutes}:${remainingSeconds} )`;
                    }
                }
            }

            return {
                orderId: order.orderId,
                name_receiver: order.receiver.name,
                phone_receiver: hiddenPhoneNumber,
                address_receiver: order.receiver.address,
                COD: order.cod.cod,
                name_product: order.product.name,
                estimated_delivery_time: estimatedDeliveryTime,
                need_to_deliver_before_expected_time: time_remaining,
                reason_for_failed_delivery: orderIssueCounts[order.orderId] || 0,
            };

        });
        if (details.length === 0) {
            return sendError(res, 'No orders yet', 404);
        }
        return sendSuccess(res, 'get list order successfully', { details });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});



/**
 * @route POST /shipper/waitForDelivery/create-issues-order/:orderId
 * @description Create an error for the order
 * @access public
 */


waitForDeliveryRouter.post('/create-issues-order/:orderId', verifyToken, verifyShipper, createOrderIssueDir, uploadImage.single('image'), async (req, res) => {
    try {
        const { issueType, description, appointment_date, statusIssues } = req.body;
        const { orderId } = req.params;
        const image = req.file ? req.file.path : null;
        const checkAllValue = { issueType, orderId, description, appointment_date, image, statusIssues }
        const errors = createOrderIssuesValidate(checkAllValue);
        if (errors) return sendError(res, errors);
        const user = await User.findById(req.decoded.userId);
        if (!user) return sendError(res, "User not found", 404);
        const staffId = req.decoded.roleId;
        const order = await Order.findOne({ orderId: orderId });
        if (!order) {
            return sendError(res, "Order not found", 404);
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
        if (!isOrderBelongsToShipper) {
            return sendError(res, "You are not the shipper.", 403);
        }
        const parts_image = image.split('\\');
        const result = await uploadSingle(image.toString(), parts_image[1], parts_image[2]);
        if (result) {
            fs.unlinkSync(image);
        }
        const newIssues = new OrderIssues({
            orderId,
            issueType,
            description,
            appointment_date,
            image: result,
            staffConfirm: staffId,
            status: statusIssues
        });
        await newIssues.save();

        await Order.findOneAndUpdate({ orderId: orderId }, {
            $set: { status: ORDER_STATUS.problem_order },
            $push: {
                tracking: {
                    scan_type: SCAN_TYPE.UNUSUAL_ORDER,
                    shipper: user.role.toString(),
                    scan_code_time: new Date().toISOString(),
                }
            }
        }, { new: true });
        return sendSuccess(res, 'Order issue created successfully');
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /shipper/waitForDelivery/receiver-information
 * @description Show recipient information
 * @access public
 */

waitForDeliveryRouter.get('/receiver-information/:orderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await Order.findOne({ orderId: orderId });
        if (!order) {
            return sendError(res, 'No orders yet');
        }
        const detail = {
            COD: parseInt(order.cod.cod) + parseInt(order.cod.fee) + parseInt(order.shipping.total_amount_after_tax_and_discount),
            receiver: order.receiver.name
        }
        return sendSuccess(res, 'get receiver information successfully', { detail });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});
/**
 * @route PATCH /shipper/waitForDelivery/sign-the-order/:orderId
 * @description Sign for the order
 * @access public
 */
waitForDeliveryRouter.patch('/sign-the-order/:orderId', verifyToken, verifyShipper, createSignatureDir, createAppSignatureDir,
    uploadImage.fields([{ name: 'signature', maxCount: 1 }, { name: 'appSignature', maxCount: 1 }]),
    async (req, res) => {
        try {
            const staffId = req.decoded.roleId;
            const orderId = req.params.orderId;
            const { substituteSignature } = req.body;
            const signature = req.files['signature'] ? req.files['signature'][0].path : null;
            const appSignature = req.files['appSignature'] ? req.files['appSignature'][0].path : null;
            const errors = signTheOrder(req.files);
            if (errors) return sendError(res, errors);
            const parts_signature = signature.split('\\');
            const result_signature = await uploadSingle(signature.toString(), parts_signature[1], parts_signature[2]);
            const url_signature = result_signature;
            if (result_signature) {
                fs.unlinkSync(signature);
            }
            const parts_appSignature = appSignature.split('\\');

            const result_appSignature = await uploadSingle(appSignature.toString(), parts_appSignature[1], parts_appSignature[2]);
            const url_appSignature = result_appSignature;
            console.log("url_appSignature",url_appSignature)
            if (result_appSignature) {
                fs.unlinkSync(appSignature);
            }
            const order = await Order.findOne({ orderId: orderId });
            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }

            // Check if the order has the change_shipper field and accept_transfer = true and matches the staffId
            if (
                order.change_shipper &&
                order.change_shipper.accept_transfer === true &&
                order.change_shipper.shipperId.toString() === staffId.toString()
            ) {
                const newTracking = {
                    scan_type: SCAN_TYPE.RECEIVED_ORDER,
                    shipper: staffId.toString(),
                    scan_code_time: new Date().toISOString(),
                };

                await Order.findOneAndUpdate({ orderId: orderId }, {
                    $push: { tracking: newTracking },
                    "sign.signed_to_receive": true,
                    "sign.signature": url_signature,
                    "sign.substituteSignature": substituteSignature,
                    "sign.appSignature": url_appSignature,
                    status: ORDER_STATUS.dispatched,
                    transportation: TRANSPORTATION_TYPE.MOTORBIKE
                }, { new: true });
            } else {
                // Check if the order has tracking with scan_type = SCAN_TYPE.SHIPPING and staffId matches the shipper
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

                if (!isOrderBelongsToShipper) {
                    return res.status(403).json({ success: false, message: 'You are not the shipper of this order.' });
                }

                const newTracking = {
                    scan_type: SCAN_TYPE.RECEIVED_ORDER,
                    shipper: staffId.toString(),
                    scan_code_time: new Date().toISOString(),
                };

                await Order.findOneAndUpdate({ orderId: orderId }, {
                    $push: { tracking: newTracking },
                    "sign.signed_to_receive": true,
                    "sign.signature": url_signature,
                    "sign.substituteSignature": substituteSignature,
                    "sign.appSignature": url_appSignature,
                    status: ORDER_STATUS.dispatched,
                    transportation: TRANSPORTATION_TYPE.MOTORBIKE
                }, { new: true });
            }
            return sendSuccess(res, 'Signed order successfully');
        } catch (error) {
            console.log(error);
            return sendServerError(res);
        }
    });

/**
 * @route PATCH /shipper/waitForDelivery/change-shipper-order/:orderId
 * @description Update new shipper for orders
 * @access public
 */
waitForDeliveryRouter.patch('/change-shipper-order/:orderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const shipperId = req.body.shipperId;
        const orderId = req.params.orderId;
        const order = await Order.findOne({ orderId: orderId });
        const errors = changeShipperOrder(req.body);
        if (errors) return sendError(res, errors);
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

        if (!isOrderBelongsToShipper) {
            return res.status(403).json({ success: false, message: 'You are not the shipper of this order.' });
        }
        const updatedOrder = await Order.findOneAndUpdate({ orderId: orderId }, {
            $set: {
                "change_shipper.shipperId": shipperId,
                "change_shipper.accept_transfer": false,
            }
        }, { new: true }
        );
        if (updatedOrder) {
            return sendSuccess(res, 'Change shipper updated successfully');
        }
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route PATCH /shipper/waitForDelivery/waiting-for-transfer
 * @description Retrieve returned orders from other shippers
 * @access public
 */
waitForDeliveryRouter.get('/waiting-for-transfer', verifyToken, verifyShipper, async (req, res) => {
    try {
        const shipperId = req.decoded.roleId;

        const query = {
            status: ORDER_STATUS.dispatching,
            "change_shipper": { "$exists": true },
            "change_shipper.accept_transfer": false,
            "change_shipper.shipperId": shipperId
        };

        const orders = await Order.find(query);
        if (orders.length === 0) {
            return sendSuccess(res, 'The list of pending orders is not available yet', { result: [] });
        }

        const result = orders.map((order) => {
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
        return sendSuccess(res, 'get list order waiting for transfer successfully', { result });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});




/**
 * @route PATCH /shipper/waitForDelivery/delivery-order-confirmation/:orderId
 * @description Shipper confirms delivery of order from another shipper
 * @access public
 */

waitForDeliveryRouter.patch('/delivery-order-confirmation/:orderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        const orderId = req.params.orderId;
        const order = await Order.findOne({ orderId: orderId });
        if (!order) {
            return sendError(res, 'Order not found');
        }

        if (!order.change_shipper) {
            return res.status(403).json({ success: false, message: 'Order cannot be transferred.' });
        }

        const shipperId = order.change_shipper.shipperId;
        if (!shipperId || shipperId.toString() !== req.decoded.roleId.toString()) {
            return res.status(403).json({ success: false, message: 'You are not the shipper of this order.' });
        }

        await Order.findOneAndUpdate({ orderId: orderId }, {
            $set: {
                "change_shipper.accept_transfer": true,
            }
        }, { new: true });

        return sendSuccess(res, 'Order confirmation successful');
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});



/**
 * @route GET /shipper/waitForDelivery/failed-orders
 * @description The shipper's failed orders
 * @access public
 */

waitForDeliveryRouter.get('/failed-orders', verifyToken, verifyShipper, async (req, res) => {
    try {
        const user = await User.findById(req.decoded.userId);
        const orders = await Order.find({ status: ORDER_STATUS.canceled });
        const filterOrders = [];
        for (const order of orders) {
            if (order.change_shipper && order.change_shipper.shipperId) {
                if (order.change_shipper.shipperId.toString() === req.decoded.roleId.toString()) {
                    const phoneNumber = order.receiver.phone;
                    const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');

                    filterOrders.push({
                        orderId: order.orderId,
                        name_receiver: order.receiver.name,
                        phone_receiver: hiddenPhoneNumber,
                        address_receiver: order.receiver.address,
                        COD: order.cod.cod,
                        name_product: order.product.name,
                    });
                }
            } else {
                const hasReceivedOrderScan = order.tracking.some((item) => {
                    return item.scan_type.toString() === SCAN_TYPE.RECEIVED_ORDER.toString() &&
                        item.shipper.toString() === req.decoded.roleId.toString();
                });
                if (hasReceivedOrderScan) {
                    const phoneNumber = order.receiver.phone;
                    const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');

                    filterOrders.push({
                        orderId: order.orderId,
                        name_receiver: order.receiver.name,
                        phone_receiver: hiddenPhoneNumber,
                        address_receiver: order.receiver.address,
                        COD: order.cod.cod,
                        name_product: order.product.name,
                    });
                }
            }
        }
        if (filterOrders.length === 0) {
            return sendError(res, 'No orders yet');
        }
        return sendSuccess(res, 'get list order failed orders successfully', { filterOrders });
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});


export default waitForDeliveryRouter;
