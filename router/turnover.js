import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import Turnover from "../model/Turnover.js";
import { verifyToken, verifyCustomer } from "../middleware/verify.js";
import { turnoverValidate } from "../validation/turnover.js";
import Order from "../model/Order.js";
import Product from "../model/Product.js";
import DeliveryService from "../model/DeliveryService.js";
import { ORDER_STATUS } from "../constant.js";
import User from "../model/User.js";

const turnoverRoute = express.Router();

/**
 * @route POST /api/turnover/
 * @description register new turnover for user
 * @access private
 */
turnoverRoute.post("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.decoded.userId);
  if (!user) {
      return sendError(res, "User not found", 404);
  }
  const errors = turnoverValidate(req.body);
  if (errors) return sendError(res, errors);

  let { total, payment_method, type_of_turnover, message } = req.body;

  try {
    const turnover = await Turnover.create({
      total,
      payment_method,
      type_of_turnover,
      message,
    });
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
  return sendSuccess(res, "turnover registered successfully.");
});

/**
 * @route PUT /api/turnover/:id
 * @description update details of an existing turnover
 * @access private
 */
turnoverRoute.put("/:id", verifyToken, async (req, res) => {
  const user = await User.findById(req.decoded.userId);
  if (!user) {
      return sendError(res, "User not found", 404);
  }
  const { id } = req.params;
  const errors = turnoverValidate(req.body);
  if (errors) return sendError(res, errors);
  let { total, payment_method, type_of_turnover, message } = req.body;
  try {
    const turnover = await Turnover.findById(id);
    if (turnover) {
      await Turnover.findByIdAndUpdate(id, {
        total,
        payment_method,
        type_of_turnover,
        message,
      });
      return sendSuccess(res, "Update turnover successfully.", {
        total: total,
        payment_method: payment_method,
        type_of_turnover: type_of_turnover,
        message: message,
      });
    }
    return sendError(res, "Turnover does not exist.");
  } catch (error) {
    console.log(error);
    return sendError(res);
  }
});

/**
 * @route GET /api/turnover/
 * @description get turnover customer
 * @access private
 */
turnoverRoute.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerid = user.role
    const Orderwaiting = await Order.find({ status: ORDER_STATUS.waiting, customer: customerid })
    const Orderaccepted = await Order.find({ status: ORDER_STATUS.accepted, customer: customerid })
    const OrderProbablyProced = await Order.find({ status: ORDER_STATUS.probablyProceed, customer: customerid })
    const Orderprocessing = await Order.find({ status: ORDER_STATUS.processing, customer: customerid })
    const Ordercompleted = await Order.find({ status: ORDER_STATUS.completed, customer: customerid })
    const Orderrefused = await Order.find({ status: ORDER_STATUS.refused, customer: customerid })
    const Ordercancel = await Order.find({ status: ORDER_STATUS.cancel, customer: customerid })
    const Orderpay = await Order.find({ status: ORDER_STATUS.pay, customer: customerid })
    const Orderunpay = await Order.find({ status: ORDER_STATUS.unpay, customer: customerid })
    let priceorderwaiting = 0
    let priceOrderaccepted = 0
    let priceOrderProbablyProced = 0
    let priceOrderprocessing = 0
    let priceOrdercompleted = 0
    let priceOrderrefused = 0
    let priceOrdercancel = 0
    let priceOrderpay = 0
    let priceOrderunpay = 0

    for (let i = 0; i < Orderwaiting.length; i++) {
      priceorderwaiting += Orderwaiting[i].total_price
    }
    for (let i = 0; i < Orderaccepted.length; i++) {
      priceOrderaccepted += Orderaccepted[i].total_price
    }
    for (let i = 0; i < OrderProbablyProced.length; i++) {
      priceOrderProbablyProced += OrderProbablyProced[i].total_price
    }
    for (let i = 0; i < Orderprocessing.length; i++) {
      priceOrderprocessing += Orderprocessing[i].total_price
    }
    for (let i = 0; i < Ordercompleted.length; i++) {
      priceOrdercompleted += Ordercompleted[i].total_price
    }
    for (let i = 0; i < Orderrefused.length; i++) {
      priceOrderrefused += Orderrefused[i].total_price
    }
    for (let i = 0; i < Ordercancel.length; i++) {
      priceOrdercancel += Ordercancel[i].total_price
    }
    for (let i = 0; i < Orderpay.length; i++) {
      priceOrderpay += Orderpay[i].total_price
    }
    for (let i = 0; i < Orderunpay.length; i++) {
      priceOrderunpay += Orderunpay[i].total_price
    }
    return sendSuccess(res, "Get turnover successfully", {
      "OrderWaiting": Orderwaiting.length,
      "Priceorderwaiting": priceorderwaiting,

      "Orderaccepted": Orderaccepted.length.length,
      "priceOrderaccepted": priceOrderaccepted,

      "OrderProbalyProced": OrderProbablyProced.length,
      "priceOrderProbablyProced": priceOrderProbablyProced,

      "Orderprocessing": Orderprocessing.length,
      "priceOrderprocessing": priceOrderprocessing,

      "Ordercompleted": Ordercompleted.length,
      "priceOrdercompleted": priceOrdercompleted,

      "Orderrefused": Orderrefused.length,
      "priceOrderrefused": priceOrderrefused,

      "Ordercancel": Ordercancel.length,
      "priceOrdercancel": priceOrdercancel,

      "Orderpay": Orderpay.length,
      "priceOrderpay": priceOrderpay,

      "Orderunpay": Orderunpay.length,
      "priceOrderunpay": priceOrderunpay,

    })
  } catch (error) {
    console.log(error)
    sendServerError(res)
  }
})

export default turnoverRoute
