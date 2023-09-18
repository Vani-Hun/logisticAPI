import express from "express";
import {
  sendError,
  sendServerError,
  sendSuccess,
} from "../helper/client.js";
import Order from "../model/Order.js";
import OrderIssue from "../model/OrderIssue.js";
import {
  ISSUES_TYPE, ORDER_STATUS
} from "../constant.js";
import { verifyToken, verifyCustomer } from "../middleware/verify.js";
import Product from "../model/Product.js";
import User from "../model/User.js";
const orderIssueRoute = express.Router();

/**
 * @route PUT /api/orderIssue/:orderId/return
 * @description Customers return goods
 * @access private
 */
orderIssueRoute.put('/:orderId/return', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.decoded.userId);
      if (!user) {
          return sendError(res, "User not found", 404);
      }
      const orderId = req.params.orderId;
      const {
        description
      } = req.body;

      const order = await Order.findOneAndUpdate({
        orderId: orderId
      },
        { status: ORDER_STATUS.problem_order });
      const isExist = await OrderIssue.exists({
        orderId: orderId
      });
      if (isExist) return sendError(res, "This orderIssues is already existed.");
      else if (!isExist) {
        const orderIssue = new OrderIssue({
          orderId: orderId,
          description: description,
          issueType: 'return',
        });
        await orderIssue.save();
        return sendSuccess(res, "successfully", {
          orderIssue
        });
      }


    } catch (err) {
      return sendServerError(res);
    }
  });
/**
 * @route GET /api/orderIssue/:id
 * @description Get orderIssues by id
 * @access private
 */
orderIssueRoute.get("/:id", async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const orderIssue = await OrderIssue.findById(id);
    if (orderIssue) return sendSuccess(res, "Get orderIssue successfully.", orderIssue);
    return sendError(res, "Information not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});
/**
 * @route GET /api/orderIssue/orderId/:orderId
 * @description Get orderIssues by orderId
 * @access private
 */
orderIssueRoute.get("/orderId/:orderId", async (req, res) => {
  try {
    const {
      orderId
    } = req.params;
    const orderIssue = await OrderIssue.findOne({
      orderId: orderId
    });
    if (orderIssue) return sendSuccess(res, "Get orderIssue by orderId successfully.", orderIssue);
    return sendError(res, "Information not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});
/**
 * @route GET /api/orderIssue/isIssues/return
 * @description Get orderIssues of customer by isIssues
 * @access private
 */
orderIssueRoute.get("/orders/issuses", verifyToken, async (req, res) => {
  const user = await User.findById(req.decoded.userId);
  if (!user) {
      return sendError(res, "User not found", 404);
  }
  const customerId = user.role;

  try {
    const returnedOrders = await Order.find({
      customer: customerId
    })

    const returnedOrderIds = returnedOrders.map((order) => order.orderId);

    const orderIssues = await OrderIssue.find({
      orderId: { $in: returnedOrderIds },
      issueType: { $in: ['prohibited', 'unreachable', 'returnToSender', 'appointment', 'return'] }
    })
    return sendSuccess(res, 'Get orderIssue successfully', orderIssues)
  } catch (error) {
    console.error(error.message);
    return sendServerError(res);
  }
});

orderIssueRoute.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.decoded.userId);
  if (!user) {
      return sendError(res, "User not found", 404);
  }
  const customerId = user.role;
  try {
    const { issueType, orderId } = req.query;

    const returnedOrders = await Order.find({ customer: customerId });
    const returnedOrderIds = returnedOrders.map((order) => order.orderId);

    const query = {
      orderId: { $in: returnedOrderIds },
      issueType: { $in: ["prohibited", "unreachable", "returnToSender", "appointment", "return"] },
    };
    if (issueType) {
      query.issueType = issueType;
    }
    if (orderId) {
      query.orderId = orderId;
    }
    const orderIssues = await OrderIssue.find(query);

    if (orderIssues.length > 0) {
      return sendSuccess(res, "Get orderIssue successfully", orderIssues);
    }
    return sendError(res, "Information not found.");
  } catch (error) {
    console.error(error.message);
    return sendServerError(res);
  }
});

export default orderIssueRoute;