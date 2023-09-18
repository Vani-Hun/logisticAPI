import express from "express";
import { io } from "socket.io-client";
import { NOTIFY_EVENT } from "../../constant.js";
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js";
import Notification from "../../model/Notification.js";
import Order from "../../model/Order.js";
import { verifyToken } from "../../middleware/verify.js";
import User from "../../model/User.js"
import { createOrderIssuesValidate } from "../../validation/orderIssues.js";
import { uploadImage } from '../../middleware/storage.js';
import { createOrderIssueDir } from '../../middleware/createDir.js';
import OrderIssues from "../../model/OrderIssue.js";
import { ORDER_STATUS, SCAN_TYPE, TRANSPORTATION_TYPE } from "../../constant.js";

const orderNotificationRoute = express.Router();

orderNotificationRoute.post("/create-issue/:orderId", verifyToken, createOrderIssueDir, uploadImage.single('image'), async (req, res) => {
  try {
    const { issueType, description, appointment_date, statusIssues } = req.body;
    const { orderId } = req.params;
    const order = await Order.findOne({_id: orderId });
    const user = await User.findOne({ role: order.customer });
    const image = req.file ? req.file.path : null;
    const checkAllValue = { issueType, orderId, description, appointment_date, image, statusIssues }
    const errors = createOrderIssuesValidate(checkAllValue);
    if (errors) return sendError(res, errors);
    if (!order) {
      return sendError(res, "Order not found.", 404);
    }
    const newIssues = new OrderIssues({
      orderId,
      issueType,
      description,
      appointment_date,
      image,
      staffConfirm: user.role,
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
    const notification = await Notification.create({
      sender: req.user.id,
      receiver: user._id,
      title: "Order Issue",
      message: `There is an issue with your order (${order.orderId}). Please check the details.`,
      link: `http://localhost:8000/api/orderNotification/detail-order/${orderId}`,
    });

    const socket = io(process.env.SOCKET_SERVER, { reconnection: true });
    socket.emit(NOTIFY_EVENT.send, order.customer, {
      title: notification.title,
      message: notification.message,
      link: notification.link,
    });

    return sendSuccess(res, "Order issue created successfully.");
  } catch (error) {
    console.log(error.message);
    return sendServerError(res);
  }
});


export default orderNotificationRoute;
