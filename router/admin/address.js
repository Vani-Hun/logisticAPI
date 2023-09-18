import express from "express";
import { sendError, sendSuccess, sendServerError } from "../../helper/client.js";
import Address from "../../model/Address.js";

const addressAdminRoute = express.Router();

/**
 * @route GET /api/admin/address
 * @description get all address
 * @access private
 * */

addressAdminRoute.get("/", async (req, res) => {
    try {
        const address = await Address.find({});
        if (address)
            return sendSuccess(
                res,
                `get address information successfully.`,
                address
            );
        return sendError(res, `address is not found.`);

    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /api/admin/address/:id
 * @description get address by id
 * @access private
 * */
addressAdminRoute.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const address = await Address.findById(id);
        if (!address) return sendError(res, "Address not found.");

        return sendSuccess(res, "Get address successfully.", address);
    } catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

/**
 * @route GET /api/admin/address/customer/:customer_id
 * @description get address list of a user
 * @access private
 * */
addressAdminRoute.get("/customer/:customer_id", async (req, res) => {
    try {
        const { customer_id } = req.params;

        const address_list = await Address.find({ customer_id: customer_id });

        if (!address_list) return sendError(res, "Address List not found.");

        return sendSuccess(res, "Get address list successfully.", address_list);
    }
    catch (error) {
        console.log(error);
        return sendServerError(res);
    }
});

export default addressAdminRoute;