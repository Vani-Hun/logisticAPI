import express from "express";
import { sendError, sendSuccess, sendServerError } from "../helper/client.js";
import { verifyToken, verifyCustomer } from "../middleware/verify.js";
import Address from "../model/Address.js";
import User from "../model/User.js";

const addressRoute = express.Router();

/**
 * @route GET /api/address/
 * @description get address list of a user
 * @access private
 * */

addressRoute.get("/", verifyToken, async (req, res) => {
  try {
    let valid_address = true;
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;
    const address_list = await Address.find({ customer_id: customerId });
    if (!address_list.length) valid_address = false;

    if (!valid_address) return sendError(res, "Address List not found.");

    return sendSuccess(res, "Get address list successfully.", address_list);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route GET /api/address/current
 * @description get current address of a user
 * @access private
 * */

addressRoute.get("/current", verifyToken, async (req, res) => {
  try {
    let valid_address = true;
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;

    const address = await Address.findOne({
      customer_id: customerId,
      default_address: true,
    });

    if (!address) valid_address = false;

    if (!valid_address) return sendError(res, "Address not found.");

    return sendSuccess(res, "Get address successfully.", address);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route POST /api/address/
 * @description add new address
 * @access private
 * */

addressRoute.post("/", verifyToken, async (req, res) => {
  try {
    let valid_address = true;
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const customerId = user.role;
    const { phone, name, address, province } = req.body;
    let default_address = req.body.default_address || false;

    if (!phone || !name || !address || !province) valid_address = false;

    if (!valid_address) return sendError(res, "Invalid address.");

    // check if there is any default address
    const exist_default = await Address.findOne({
      customer_id: customerId,
      default_address: true,
    });

    if (!exist_default) default_address = true;
    else if (default_address) {
      // if the current address is default, set all other address of the user to false
      await Address.updateMany(
        { customer_id: customerId },
        { default_address: false }
      );
    }

    const new_address = await Address.create({
      customer_id: customerId,
      phone,
      name,
      address,
      province,
      default_address,
    });

    return sendSuccess(res, "Add new address successfully.", new_address);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route PUT /api/address/:address_id
 * @description update address
 * @access private
 * */

addressRoute.put("/:address_id", verifyToken, async (req, res) => {
  try {
    let valid_update = true;
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const { address_id } = req.params;
    const customerId = user.role;

    // the user dont need to send all the fields
    const { phone, name, address, province, default_address } = req.body;

    const existed_address = await Address.findById(address_id);


    if (existed_address) {
      if (phone) existed_address.phone = phone;
      if (name) existed_address.name = name;
      if (address) existed_address.address = address;
      if (province) existed_address.province = province;

      // change other default address to false if the current address is default
      if (default_address === true) {
        await Address.updateMany(
          { customer_id: customerId },
          { default_address: false }
        );
      }

      if (default_address === true || default_address === false) existed_address.default_address = default_address;

      await existed_address.save();
    }
    else valid_update = false;

    if (!valid_update) return sendError(res, "Update address failed.");

    return sendSuccess(res, "Update address successfully.", existed_address);

  }
  catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route DELETE /api/address/:address_id
 * @description delete address
 * @access private
 * */

addressRoute.delete("/:address_id", verifyToken, async (req, res) => {
  try {
    let valid_delete = true
    const user = await User.findById(req.decoded.userId);
    if (!user) {
        return sendError(res, "User not found", 404);
    }
    const { address_id } = req.params
    if (address_id.length !== 24) {
      return sendError(res, "Wrong ID of address")
    } else {
      const isExist = await Address.exists({ _id: address_id })
      if (!isExist) {
        return sendError(res, "address not found")
      }
    }
    const delete_address = await Address.findByIdAndDelete(address_id);
    if (!delete_address) valid_delete = false;
    if (!valid_delete) return sendError(res, "Delete address failed.");
    return sendSuccess(res, "Delete address successfully.");
  }
  catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

export default addressRoute;