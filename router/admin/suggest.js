import express from "express";
import { sendError, sendSuccess, sendServerError } from "../../helper/client.js";
import Suggest from "../../model/Suggest.js";
import { verifyCustomer } from "../../middleware/verify.js";

const suggestAdminRoute = express.Router();

/**
 * @route GET /api/admin/suggest/
 * @description admin get all suggest
 * @access private
 */

suggestAdminRoute.get("/", async (req, res) => {
  try {
    const suggest = await Suggest.find();
    if (!suggest.length) return sendError(res, "No suggest found.");

    return sendSuccess(res, "Get suggests successfully.", suggest);
  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

/**
 * @route GET /api/admin/suggest/:customer_id
 * @description admin get all suggest of 1 customer
 * @access private
 */

suggestAdminRoute.get("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params
    const suggest = await Suggest.find({ customer: customerId });
    return sendSuccess(res, "Get suggest successfully.", suggest);
  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

/**
 * @route GET /api/admin/suggest/detail/:_id
 * @description admin get a suggest
 * @access public
 */

suggestAdminRoute.get("/detail/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    if (_id.length !== 24) {
      return sendError(res, "No suggest found.")
    }
    const suggest = await Suggest.findById(_id);
    if (!suggest) return sendError(res, "No suggest found.");
    return sendSuccess(res, "Get suggest successfully.", suggest);
  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

/**
 * @route DELETE /api/admin/suggest/:_id
 * @description admin delete suggest
 * @access private
 */

suggestAdminRoute.delete("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;
    if (_id.length !== 24) {
      return sendError(res, "No suggest found.")
    }
    const suggest = await Suggest.findByIdAndDelete(_id);
    if (!suggest) return sendError(res, "Suggest not found.");

    return sendSuccess(res, "Delete suggest successfully.");
  } catch (error) {
    console.log(error);
    sendServerError(res, error);
  }
});

export default suggestAdminRoute;