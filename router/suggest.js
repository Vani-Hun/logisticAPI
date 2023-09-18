import express from "express";
import { sendError, sendSuccess, sendServerError } from "../helper/client.js";
import { verifyToken, verifyCustomer } from "../middleware/verify.js";
import Suggest from "../model/Suggest.js";
import Customer from "../model/Customer.js";
import Order from "../model/Order.js";
import User from "../model/User.js";
import { createSuggestValidate } from "../validation/suggest.js";



const suggestRoute = express.Router();

/**
 * @route GET /api/suggest/
 * @description customer get all of their suggest
 * @access private
 */

suggestRoute.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customer_id = user.role;
    const customer = await Customer.findById(customer_id);
    if (!customer) return sendError(res, "Customer not found.");

    const suggest = await Suggest.find({ customer: customer_id });
    if (!suggest || !suggest.length)
      return sendError(res, "No suggest found.");

    return sendSuccess(res, "Get suggest successfully.", suggest);
  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

/**
 * @route POST /api/suggest/
 * @description customer send feedback
 * @access private
 */

suggestRoute.post("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    let { phone, address, order_id, content } = req.body;

    const errors = createSuggestValidate(req.body, req.user);
    if (errors) return sendError(res, errors);

    const orders = await Order.findOne({
      $and: [
        { orderId: order_id }, { customer: user.role }
      ]
    });
    if (!orders) return sendError(res, "Order not found");

    if (phone == null || phone == "") {
      phone = user.phone;
    }
    if (address == null || address == "") {
      const customer = await Customer.findById(user.role)
      address = customer.address;
    }

    const suggest = new Suggest({
      customer: user.role,
      phone,
      address,
      orderId: order_id,
      content,
    });

    await Suggest.create(suggest);
    return sendSuccess(res, "Send suggest successfully.", suggest);
  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

export default suggestRoute;
