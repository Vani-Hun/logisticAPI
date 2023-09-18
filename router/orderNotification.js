import express from "express";
import { io } from "socket.io-client";
import { NOTIFY_EVENT } from "../constant.js";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import Notification from "../model/Notification.js";
import Order from "../model/Order.js";
import { verifyToken, verifyCustomer } from "../middleware/verify.js";
import Customer from "../model/Customer.js"
import User from "../model/User.js"
import Staff from "../model/Staff.js";


const orderNotificationRoute = express.Router();

orderNotificationRoute.get("/", verifyToken, async (req, res) => {
  const limit = req.query.limit || 15;
  const user = await User.findById(req.decoded.userId);
  if (!user) {
    return sendError(res, "User not found", 404);
  }
  try {
    const { fromDate, toDate } = req.query;
    let query = { receiver: user._id };
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      endDate.setDate(endDate.getDate() + 1);
      query.createdAt = {
        $gte: startDate,
        $lt: endDate,
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    if (notifications.length === 0) {
      return sendError(res, 'No notification yet');
    }
    return sendSuccess(res, "Request successful.", notifications);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

orderNotificationRoute.get("/detail-issues/:notificationId", verifyToken, async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId) {
      return sendError(res, "This message does not exist");
    }
    const user = await User.findById(req.decoded.userId);
    if (!user) {
      return sendError(res, "You are not the owner of this message.");
    }
    const notification = await Notification.findOne({ "_id": notificationId, "receiver": user._id });
    if (!notification) {
      return sendError(res, "There are no notifications!");
    }
    return sendSuccess(res, "Get notification success!", notification);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

orderNotificationRoute.get("/detail-order/:orderId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    const orderId = req.params.orderId;
    const order = await Order.findOne({ "orderId": orderId, "customer": user.role });
    if (!order) {
      return sendError(res, "Order not found!");
    }
    const phoneNumber = order.receiver.phone;
    const hiddenPhoneNumber = phoneNumber.substring(phoneNumber.length - 4).padStart(phoneNumber.length, '*');
    const formattedOrder = {
      orderId: order.orderId,
      name_receiver: order.receiver.name,
      phone_receiver: hiddenPhoneNumber,
      address_receiver: order.receiver.address,
      COD: order.cod.cod,
      name_product: order.product.name,
    };
    res.json({ message: "Order found", formattedOrder });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});
export default orderNotificationRoute;
