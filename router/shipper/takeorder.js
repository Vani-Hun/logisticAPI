import express from 'express'
import { sendError, sendServerError, sendSuccess } from '../../helper/client.js'
import { verifyToken, verifyShipper } from "../../middleware/verify.js"
import { createOrderIssueDir, createOrderDir } from "../../middleware/createDir.js"
import Order from '../../model/Order.js'
import mongoose from "mongoose"
import PostOffice from '../../model/PostOffice.js'
import Staff from '../../model/Staff.js'
import { validateCreateOrderByShipper, validateAllProblemOrder, TrackingValidateForShipper } from '../../validation/order.js'
import { COD_STATUS, ORDER_STATUS, SCAN_TYPE, STAFF } from '../../constant.js'
import { uploadResourcesOrderImage, uploadResourcesOrderIssueImage } from '../../middleware/storage.js'
import { genarateBillofLandingID, genarateOrderID } from '../../service/order.js'
import OrderIssue from '../../model/OrderIssue.js'
import fs from 'fs'
import { deleteSingle, uploadSingle } from "../../helper/connectCloud.js"

const takeOrderShipperRoute = express.Router()

/**
 * @route GET /api/shipper/takeOrder/take
 * @description shipper take assigned order
 * @access public
 */
takeOrderShipperRoute.get('/take', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;
        const typeTakeOrder = req.body.typeTakeOrder;
        let info = [];
        if (typeTakeOrder === "order") {
            const orders = await Order.find({ assign_shipper: staffID, status: "in progress" });
            orders.forEach((data) => {
                const phone = data.receiver.phone;
                const hiddenPhone = phone.substring(phone.length - 4).padStart(phone.length, '*');
                const timeScan = data.tracking[data.tracking.length - 1].scan_code_time;
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
            return sendSuccess(res, 'Take assigned order successfully', {
                Count: orders.length,
                Order: info
            });
        }
        else {
            if (typeTakeOrder === "customer") {
                const ordersCustomer = await Order.aggregate([
                    { $match: { "assign_shipper": new mongoose.Types.ObjectId(staffID), "status": "in progress" } },
                    { $group: { _id: "$receiver", count: { $sum: 1 } } }
                ]);
                return sendSuccess(res, 'Take assigned order successfully', { ordersCustomer });
            }
            else {
                return sendError(res, 'typeTakeOrder not correct')
            }
        }

    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route GET /api/shipper/takeOrder/show-address
 * @description show-address for shipper
 * @access public
 */
takeOrderShipperRoute.get('/show-address', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;
        const orders = await Order.aggregate([
            { $match: { "assign_shipper": new mongoose.Types.ObjectId(staffID), "status": "in progress" } },
            { $group: { _id: "$destination" } }
        ]);
        let addressId = [];
        await orders.forEach((info) => {
            let id = info._id;
            addressId.push(id);
        });
        const addressPostOffice = await PostOffice.find({ _id: addressId });
        return sendSuccess(res, 'Show address successfully', { addressPostOffice });

    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route GET /api/shipper/takeOrder/show-order-detail/:OrderId
 * @description show-order-detail
 * @access public
 */
takeOrderShipperRoute.get('/show-order-detail/:OrderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const id = req.params.OrderId;
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
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route PATCH /api/shipper/takeOrder/receive/:OrderId
 * @description receive order
 * @access public
 */
takeOrderShipperRoute.patch('/receive/:OrderId', verifyToken, verifyShipper, createOrderDir, uploadResourcesOrderImage.array('image'), async (req, res) => {
    try {
        const orderId = req.params.OrderId;
        const isExistOrder = await Order.findOne({ orderId: orderId });
        if (!isExistOrder)
            return sendError(res, "Order not exist");
        if (isExistOrder.status != ORDER_STATUS.in_progress && isExistOrder.status != ORDER_STATUS.dispatching)
            return sendError(res, "Orders not allow delivery");
        if (req.body.scan_type != "shipping")
            return sendError(res, "Scan type not shipping")
        if (req.body.weight === "")
            return sendError(res, "Weight is required");
        else {
            if (isExistOrder.product.weight != +req.body.weight)
                return sendError(res, "Weight not match");
        }
        const errors = TrackingValidateForShipper(req.body);
        if (errors)
            return sendError(res, errors);
        let images = [];
        const files = req.files.map((file) => {
            let fileImage = `${file.destination}${file.filename}`
            let nameImage = file.filename
            let resultImage = uploadSingle(fileImage, "order", nameImage)
            if (resultImage) {
                fs.unlinkSync(fileImage, (err) => {
                    console.log(err)
                })
            }
            images.push(resultImage.secure_url);
        });
        const staffId = req.decoded.roleId;
        let scan_body = {
            scan_type: req.body.scan_type,
            scan_code_time: Date.now()
        }

        let post_office = req.body.post_office;
        scan_body = {
            ...scan_body,
            shipper: staffId,
            transportation: req.body.transportation,
        }

        if (scan_body.hasOwnProperty('shipper')) {
            if (mongoose.isValidObjectId(scan_body.shipper) == false) {
                return sendError(res, "shipper is not valid ObjectId");
            }
            const shipper = await Staff.findById(scan_body.shipper);
            if (shipper == null || shipper == undefined) {
                return sendError(res, "Staff does not exist.")
            }
            if (shipper.staff_type != STAFF.SHIPPER) {
                return sendError(res, "Staff is not shipper.",)
            }
        }

        if (post_office != null) {
            if (mongoose.isValidObjectId(post_office) == false) {
                return sendError(res, "post_office is not valid ObjectId");
            }
            const postOffice = await PostOffice.findById(post_office);
            if (postOffice == null || postOffice == undefined) {
                return sendError(res, "Post office does not exist.")
            }
        }

        const order = await Order.findOne({ orderId })
        if (!order)
            return sendError(res, "Order does not exist.", 404)
        if (order.tracking == undefined) {
            order.tracking = [];
            order.tracking.push(scan_body);
        }
        else {
            const lenTrackings = order.tracking.length;
            if (lenTrackings == 0) {
                order.tracking.push(scan_body);
            }
            else {
                if (order.tracking[lenTrackings - 1].scan_type == scan_body.scan_type && order.tracking[lenTrackings - 1].shipper == scan_body.shipper) {
                    order.tracking[lenTrackings - 1] = scan_body;
                }
                else {
                    order.tracking.push(scan_body);
                }
            }
        }
        let timelineOrder = {
            status: "dispatching"
        }
        if (order.timeline == undefined) {
            order.timeline = [];
            order.timeline.push(timelineOrder);
        }
        else {
            const lenTimelines = order.timeline.length;
            if (lenTimelines == 0) {
                order.timeline.push(timelineOrder);
            }
            else {
                if (order.timeline[lenTimelines - 1].status != ORDER_STATUS.dispatching) {
                    order.timeline.push(timelineOrder);
                }
            }
        }

        let updateValue = {
            tracking: order.tracking,
            destination: post_office,
            status: "dispatching",
            timeline: order.timeline,
            image: images
        }

        await Order.findOneAndUpdate({ orderId }, updateValue);
        return sendSuccess(res, "successfully.", { orderId: orderId })

    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route POST /api/shipper/takeOrder/order-issue/:OrderId
 * @description order issue
 * @access public
 */
takeOrderShipperRoute.post('/order-issue/:OrderId', verifyToken, verifyShipper, createOrderIssueDir, uploadResourcesOrderIssueImage.array('image'), async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const orderId = req.params.OrderId;
        const isExistOrder = await Order.findOne({ orderId: orderId });
        if (!isExistOrder)
            return sendError(res, "Order not exist");
        const error = validateAllProblemOrder(req.body);
        if (error)
            return sendError(res, error);
        let images = [];
        const issue = await OrderIssue.create({
            orderId: orderId,
            staffConfirm: staffId,
            issueType: req.body.issueType,
            status: "processing",
            description: req.body.description,
            note: req.body.note,
            image: images
        });
        const files = req.files.map(async (file) => {
            let fileImage = await `${file.destination}${file.filename}`
            let nameImage = await file.filename
            let resultImage = await uploadSingle(fileImage, "orderIssue", nameImage)
            if (resultImage) {
                fs.unlinkSync(fileImage, (err) => {
                    console.log(err)
                })
            }
            images.push(resultImage.secure_url);
            await OrderIssue.findOneAndUpdate({ _id: issue._id }, { image: images });
        });
        let timelineOrder = {
            status: "problem order"
        }
        isExistOrder.timeline.push(timelineOrder);
        isExistOrder.status = "problem order";
        let scan_body = {
            scan_type: "unusual_order",
            scan_code_time: Date.now(),
            shipper: staffId
        }
        isExistOrder.tracking.push(scan_body);
        let updatevalue = {
            status: isExistOrder.status,
            timeline: isExistOrder.timeline,
            tracking: isExistOrder.tracking
        };
        await Order.findOneAndUpdate({ orderId }, updatevalue);
        return sendSuccess(res, "Create order issue successfully");
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route GET /api/shipper/takeOrder/show-order-problem/:OrderId
 * @description show all problem order
 * @access public
 */
takeOrderShipperRoute.get('/show-order-problem/:OrderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const orderId = req.params.OrderId;
        const isExistOrder = await Order.find({ orderId: orderId });
        if (!isExistOrder)
            return sendError(res, "Order not exist");
        const allProblemOrder = await OrderIssue.find({ orderId: orderId });
        let arrayproblem = [];
        await allProblemOrder.forEach((info) => {
            let prolem = { id: info._id, idorder: info.orderId, problem: info.issueType };
            arrayproblem.push(prolem);
        });
        return sendSuccess(res, "Get all problem order successfully", arrayproblem);
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route DELETE /api/shipper/takeOrder/delete-order-problem/:AllProblemOrderId
 * @description show all problem order
 * @access public
 */
takeOrderShipperRoute.delete('/delete-order-problem/:AllProblemOrderId', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const problemId = req.params.AllProblemOrderId;
        const isExistProblemOrder = await OrderIssue.findById(problemId);
        if (!isExistProblemOrder)
            return sendError(res, "Problem order not exist");
        const problem = await OrderIssue.findByIdAndRemove(problemId);
        const orderproblem = await OrderIssue.findOne({ orderId: isExistProblemOrder.orderId });
        if (!orderproblem) {
            const order = await Order.findOne({ orderId: isExistProblemOrder.orderId });
            let timelineOrder = {
                status: "in progress"
            }
            order.timeline.push(timelineOrder);
            order.status = "in progress";
            let scan_body = {
                scan_type: "incoming_postoffice",
                scan_code_time: Date.now(),
                shipper: staffId
            }
            order.tracking.push(scan_body);
            let updatevalue = {
                status: order.status,
                timeline: order.timeline,
                tracking: order.tracking
            };
            let orderId = order.orderId;
            await Order.findOneAndUpdate({ orderId }, updatevalue);
        }
        return sendSuccess(res, "Delete problem order successfully", problem);
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

/**
 * @route GET /api/shipper/takeOrder/history-order
 * @description show history order
 * @access public
 */
takeOrderShipperRoute.get('/history-order', verifyToken, verifyShipper, async (req, res) => {
    try {
        const staffID = req.decoded.roleId;
        const orders = await Order.find({ assign_shipper: staffID });
        let info = [];
        orders.forEach((data) => {
            const phone = data.receiver.phone;
            const hiddenPhone = phone.substring(phone.length - 4).padStart(phone.length, '*');
            const timeScan = data.tracking[data.tracking.length - 1].scan_code_time;
            let order = {
                orderId: data.orderId,
                name_receiver: data.receiver.name,
                phone_receiver: hiddenPhone,
                address_receiver: data.receiver.address,
                name_product: data.product.name,
                status: data.status,
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

/**
 * @route POST /api/shipper/takeOrder/create-order-by-shipper
 * @description order issue
 * @access public
 */
takeOrderShipperRoute.post('/create-order-by-shipper', verifyToken, verifyShipper, createOrderDir, uploadResourcesOrderImage.array('image'), async (req, res) => {
    try {
        const staffId = req.decoded.roleId;
        const error = validateCreateOrderByShipper(req.body);
        if (error)
            return sendError(res, error);
        const {
            phone_sender,
            name_sender,
            address_sender,
            phone_receiver,
            name_receiver,
            address_receiver,
            origin,
            destination,
            payment_methods,
            transportation,
            name_product,
            value_product,
            type_product,
            weight_product,
            quantity_product,
            type_shipping,
            cod,
            fee_cod,
            insurance_fee,
            other_shipping,
            total_shipping,
            note_shipping,
            scan_type,
            cash_payment
        } = req.body
        const orderId = await genarateOrderID();
        const shippingId = await genarateBillofLandingID();
        let images = [];
        const files = req.files.map(async (file) => {
            let fileImage = await `${file.destination}${file.filename}`
            let nameImage = await file.filename
            let resultImage = await uploadSingle(fileImage, "order", nameImage)
            if (resultImage) {
                fs.unlinkSync(fileImage, (err) => {
                    console.log(err)
                })
            }
            images.push(resultImage.secure_url);
            await Order.findOneAndUpdate({ orderId }, { image: images });
        });
        let sender = {
            name: name_sender,
            phone: phone_sender,
            address: address_sender
        };
        let receiver = {
            name: name_receiver,
            phone: phone_receiver,
            address: address_receiver
        };
        let scan_body = {
            scan_type: scan_type,
            scan_code_time: Date.now(),
            shipper: staffId,
            transportation: transportation
        };
        let feedback = {
            user: "",
            content: ""
        };
        let _cod = {
            timeline: [],
            cod: '0',
            fee: '0',
            control_money: '0'
        };
        _cod.cod = cod;
        _cod.fee = fee_cod;
        _cod.timeline.push({
            status: COD_STATUS.waiting,
            time: Date.now()
        });
        let shipping = {
            id: shippingId,
            insurance_fees: insurance_fee,
            fuel_surcharge: '0',
            remote_areas_surcharge: '0',
            other: other_shipping,
            note: note_shipping,
            copyright_fee: '0',
            amount_payable: '0',
            standard_fee: '0',
            total_amount_before_discount: '0',
            total_amount_after_discount: '0',
            total_amount_after_tax_and_discount: total_shipping,
            pick_up_time: Date.now(),
            type_shipping: type_shipping
        };
        let product = {
                name: name_product,
                quantity: quantity_product,
                types: type_product,
                goods_value: value_product,
                unit: "",
                weight: weight_product,
                other: "",
                note: "",
                service: "",
                payment_person: "",
                payment_methods: payment_methods,
                cash_payment: cash_payment
        };
        let timelineOrder = {
            status: "dispatching"
        }
        let company = {
            name: "",
            address: "",
            note: ""
        }

        const order = await Order.create({
            orderId,
            assign_shipper: staffId,
            sender: sender,
            receiver: receiver,
            origin: origin,
            status: ORDER_STATUS.dispatching,
            destination: destination,
            route: [],
            tracking: [scan_body],
            feedback: [feedback],
            cod: _cod,
            shipping: shipping,
            product: product,
            timeline: [timelineOrder],
            company: company,
            image: images
        });

        return sendSuccess(res, "Create order by shipper successfully", { orderId: order.orderId });
    } catch (error) {
        console.error(error)
        return sendError(res, 'Internal server error')
    }

})

export default takeOrderShipperRoute