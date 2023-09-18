import express from "express";
import { sendError, sendSuccess, sendServerError } from "../helper/client.js";
import Discount from "../model/Discount.js";
import { verifyToken } from "../middleware/verify.js";
import mongoose from "mongoose";
import User from "../model/User.js";

const discountRoute = express.Router();

/**
 * @route GET /api/discount/:customerId
 * @description get discount list of a user
 * @access private
 */

discountRoute.get("/:customerId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const { customerId } = req.params
    let listDiscount = await Discount.find({ customer_id: customerId });
    return sendSuccess(res, "Get list discount successfully.", listDiscount);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

export default discountRoute;
