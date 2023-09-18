import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import Fee from "../../model/Fee.js";
import { checkFeeValidate } from "../../validation/fee.js";

const feeAdminRoute = express.Router();


/**
 * @route GET /api/admin/fee
 * @description create new fee VAT, fuel fee
 * @access private
 */
feeAdminRoute.get("/", async (req, res) => {
    try {
        const fee = await Fee.find({});
        return sendSuccess(res, "Get information fee successfully.", fee);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route POST /api/admin/fee/create
 * @description create new fee VAT, fuel fee
 * @access private
 */
feeAdminRoute.post("/create", async (req, res) => {
    try {
        const err = await checkFeeValidate(req.body);
        if (err)
            return sendError(res,err);
        const {VAT, fuel_fee} = await req.body;
        const fee = await Fee.create({
            VAT: VAT, 
            fuel_fee: fuel_fee
        });
        if (!fee)
            return sendError(res, "Create new fee failed");
        return sendSuccess(res, "Create new fee successfully.");
    } catch (error) {
        console.log(error);
        return sendServerError(res)
    }
});

/**
 * @route PUT /api/admin/fee/update/:feeId
 * @description update details of an existing fee
 * @access private
 */
feeAdminRoute.put("/update/:feeId", async (req, res) => {
    try {
        const err = await checkFeeValidate(req.body);
        if (err)
            return sendError(res,err);
        const {VAT, fuel_fee} = await req.body;
        const feeId = await req.params.feeId;
        if (!feeId)
            return sendError(res, "Id of Fee is required");
        const fee = await Fee.findById({ _id: feeId });
        if (!fee)
            return sendError(res,"Fee information is not exist");
        await Fee.findByIdAndUpdate(feeId, {VAT: VAT, fuel_fee: fuel_fee});
        return sendSuccess(res, "Update fee information successfully");
    } catch (error) {
        console.log(error);
        return sendServerError(res)
    }
});

/**
 * @route DELETE /api/admin/fee/dele/:feeId
 * @description delete an existing fee
 * @access private
 */
feeAdminRoute.delete("/dele/:feeId", async (req, res) => {

  try {
        const feeId = await req.params
        if (!feeId)
            return sendError(res, "Id of Fee is required");
        const fee = await Fee.findById(feeId);
        if (!fee)
            return sendError(res,"Fee information is not exist");
        await Fee.findByIdAndRemove(feeId);
        return sendSuccess(res, "Delete feature successfully.")
  } catch (error) {
        console.log(error);
        return sendServerError(res)
  }
});

export default feeAdminRoute
