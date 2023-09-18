import express from "express";
import { verifyToken, verifyShipper } from "../../middleware/verify.js";
import User from "../../model/User.js";
import Order from "../../model/Order.js";
import { ORDER_STATUS, SCAN_TYPE, TRANSPORTATION_TYPE, COD_STATUS } from "../../constant.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import { signTheOrder } from "../../validation/order.js";
import { uploadResourcesOrderIssueImage, uploadImage } from "../../middleware/storage.js";
import { createOrderIssueDir, createSignatureDir, createAppSignatureDir } from '../../middleware/createDir.js';
import fs from 'fs'
import { uploadSingle } from "../../helper/connectCloud.js"
import Staff from "../../model/Staff.js";
const signOfflineRoute = express.Router();


signOfflineRoute.patch('/sign/:orderId/order', verifyToken, createSignatureDir, createAppSignatureDir,
    uploadImage.fields([{ name: 'signature', maxCount: 1 }, { name: 'appSignature', maxCount: 1 }]),
    async (req, res) => {
        try {
            const staffId = req.decoded.roleId;
            const role = await Staff.findById(staffId)
            if (!role.staff_type === 'shipper') return sendError(res, "You are not a shipper");
            const orderId = req.params.orderId;
            const { substituteSignature } = req.body;
            const errors = signTheOrder(req.files);
            if (errors) return sendError(res, errors);
            const signature = req.files['signature'] ? req.files['signature'][0].path : null;
            const parts_signature = signature.split('\\');
            const result_signature = await uploadSingle(signature.toString(), parts_signature[1], parts_signature[2]);
            const url_signature = result_signature.url;
            if (signature) {
                fs.unlinkSync(signature);
            }
            const appSignature = req.files['appSignature'] ? req.files['appSignature'][0].path : null;
            const parts_appSignature = appSignature.split('\\');
            const result_appSignature = await uploadSingle(appSignature.toString(), parts_appSignature[1], parts_appSignature[2]);
            const url_appSignature = result_appSignature.url;
            if (appSignature) {
                fs.unlinkSync(appSignature);
            }
            const order = await Order.findOne({ orderId: orderId });
            if (!order) {
                return sendError(res, 'Invalid orderId');
            }
            if (order.cod && (order.cod.cod.toString() !== '0' || order.cod.status.toString() !== COD_STATUS.paid)) {
                return sendError(res, "Cannot sign offline for orders with unpaid COD or non-zero COD amount")
            }
            if (!order) {
                return sendError(res, 'Order not found')
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
                    return sendError(res, 'You are not the shipper of this order.');
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
export default signOfflineRoute;