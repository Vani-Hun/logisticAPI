import express from "express";
import { sendError, sendSuccess, sendServerError } from "../../helper/client.js";
import Discount from "../../model/Discount.js";
import Customer from "../../model/Customer.js";
import { CUSTOMER_RANK } from "../../constant.js";

const discountAdminRoute = express.Router();

/**
 * @route GET /api/admin/discount
 * @description get all discount
 * @access private
 * */

discountAdminRoute.get("/", async (req, res) => {
  try {
    const discount = await Discount.find({});
    if (discount)
      return sendSuccess(
        res,
        `get discount information successfully.`,
        discount
      );
    return sendError(res, `discount is not found.`);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route GET /api/admin/discount/:rank
 * @description get discount by rank
 * @access private
 */
discountAdminRoute.get("/:rank", async (req, res) => {
  try {
    const { rank } = req.params;

    const listDiscount = await Discount.find({ rank: rank });
    if (!listDiscount || !listDiscount.length)
      return sendError(res, "Discount not found.");

    return sendSuccess(res, "Get discount successfully.", listDiscount);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route POST /api/admin/discount/individual
 * @description create new discount for 1 user
 * @access private
 */
discountAdminRoute.post("/:customerId", async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      title,
      rank,
      description,
      discount,
      image,
      status,
      start_date,
      end_date,
    } = req.body;

    if (status == undefined) {
      return sendError(res, "Please enter status fields.");
    }
    // validate input
    if (
      !title ||
      !rank ||
      !description ||
      !discount ||
      !start_date ||
      !end_date
    )
      return sendError(res, "Please enter all required fields.");

    // check type of input
    if (typeof title !== "string") return sendError(res, "Invalid title");
    if (typeof rank !== "string") return sendError(res, "Invalid rank");
    if (typeof description !== "string")
      return sendError(res, "Invalid description");
    if (typeof discount !== "number") return sendError(res, "Invalid discount");
    if (discount < 0 || discount > 100)
      return sendError(res, "Discount must be between 0 and 100");

    if (typeof status !== "boolean") return sendError(res, "Invalid status");

    const starttime = Date.parse(start_date);
    if (isNaN(starttime)) return sendError(res, "Wrong start date format");

    const endtime = Date.parse(end_date);
    if (isNaN(endtime)) return sendError(res, "Wrong end date format");

    if (starttime < Date.now())
      return sendError(res, "Start date must be after current date");
    if (endtime < Date.now())
      return sendError(res, "End date must be after current date");

    if (starttime > endtime)
      return sendError(res, "Start date must be before end date");

    await Discount.create({
      customer_id: customerId,
      title,
      rank,
      description,
      discount,
      image,
      status,
      start_date,
      end_date,
    })

    return sendSuccess(res, "Create discount successfully.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route POST /api/admin/discount/
 * @description create new discount for all user
 * @access private
 */
discountAdminRoute.post("/", async (req, res) => {
  try {
    const {
      title,
      rank,
      description,
      discount,
      image,
      status,
      start_date,
      end_date,
    } = req.body;

    if (status == undefined) {
      return sendError(res, "Please enter status fields.");
    }
    // validate input
    if (
      !title ||
      !rank ||
      !description ||
      !discount ||
      !start_date ||
      !end_date
    )
      return sendError(res, "Please enter all required fields.");

    // check type of input
    if (typeof title !== "string") return sendError(res, "Invalid title");
    if (typeof rank !== "string") return sendError(res, "Invalid rank");
    if (typeof description !== "string")
      return sendError(res, "Invalid description");
    if (typeof discount !== "number") return sendError(res, "Invalid discount");
    if (discount < 0 || discount > 100)
      return sendError(res, "Discount must be between 0 and 100");

    if (typeof status !== "boolean") return sendError(res, "Invalid status");

    const starttime = Date.parse(start_date);
    if (isNaN(starttime)) return sendError(res, "Wrong start date format");

    const endtime = Date.parse(end_date);
    if (isNaN(endtime)) return sendError(res, "Wrong end date format");

    if (starttime < Date.now())
      return sendError(res, "Start date must be after current date");
    if (endtime < Date.now())
      return sendError(res, "End date must be after current date");

    if (starttime > endtime)
      return sendError(res, "Start date must be before end date");

    // get all user and create discount for them
    const listCustomer = await Customer.find({});
    if (!listCustomer || !listCustomer.length) return sendError(res, "User not found.");

    const listDiscount = listCustomer.map((customer) => ({
      customer_id: customer._id,
      title,
      rank,
      description,
      discount,
      image,
      status,
      start_date,
      end_date,
    }));

    await Discount.insertMany(listDiscount);

    return sendSuccess(res, "Create discount successfully.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route PUT /api/admin/discount/type/:typeId
 * @description change discount information
 * @access private
 */

discountAdminRoute.put("/type/:typeId", async (req, res) => {
  try {
    const { typeId } = req.params;

    const discountInfo = await Discount.findOne({ type_id: typeId });

    if (!discountInfo)
      return sendError(res, `discount ${typeId} is not found.`);

    // check if body contains undefined field
    const existedFields = Object.keys(discountInfo._doc);
    const fields = Object.keys(req.body);
    const isExisted = fields.every((field) => existedFields.includes(field));

    if (!isExisted)
      return sendError(
        res,
        `field ${fields.filter(
          (field) => !existedFields.includes(field)
        )} is not existed`
      );

    // validate input
    const {
      title,
      rank,
      description,
      discount,
      image,
      status,
      start_date,
      end_date,
    } = req.body;

    // check type of input, provided that user don't need to update all fields
    if (title && typeof title !== "string")
      return sendError(res, "Invalid title");
    if (rank && typeof rank !== "string") return sendError(res, "Invalid rank");
    if (description && typeof description !== "string")
      return sendError(res, "Invalid description");
    if (discount) {
      if (typeof discount !== "number")
        return sendError(res, "Invalid discount");

      if (discount < 0 || discount > 100)
        return sendError(res, "Discount must be between 0 and 100");
    }

    if (status && typeof status !== "boolean")
      return sendError(res, "Invalid status");

    let starttime = Date.parse(discountInfo.start_date);
    let endtime = Date.parse(discountInfo.end_date);

    if (start_date) {
      starttime = Date.parse(start_date);
      if (isNaN(starttime)) return sendError(res, "Wrong start date format");

      if (starttime < Date.now())
        return sendError(res, "Start date must be after current date");
    }

    if (end_date) {
      endtime = Date.parse(end_date);
      if (isNaN(endtime)) return sendError(res, "Wrong end date format");

      if (endtime < Date.now())
        return sendError(res, "End date must be after current date");
    }

    if (starttime > endtime)
      return sendError(res, "Start date must be before end date");

    // update all discount with the same type
    const listDiscount = await Discount.find({ type_id: typeId });
    await Promise.all(
      listDiscount.map((eachDiscount) =>
        eachDiscount.updateOne({
          title,
          rank,
          description,
          discount,
          image,
          status,
          start_date,
          end_date,
        })
      )
    );

    return sendSuccess(res, "update discount information successfully.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route DELETE /api/admin/discount/:_id
 * @description delete 1 specific discount
 * @access private
 */

discountAdminRoute.delete("/:_id", async (req, res) => {
  try {
    const { _id } = req.params;

    const discountInfo = await Discount.findOne({ _id: _id });

    if (!discountInfo) return sendError(res, `discount ${_id} is not found.`);

    await Discount.deleteOne({ _id: _id });

    return sendSuccess(res, "delete discount successfully.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route DELETE /api/admin/discount/type/:typeId
 * @description delete all discount of same type
 * @access private
 */

discountAdminRoute.delete("/type/:typeId", async (req, res) => {
  try {
    const { typeId } = req.params;
    const listDiscount = await Discount.find({ type_id: typeId });

    if (!listDiscount || !listDiscount.length)
      return sendError(res, `discount type ${typeId} is not found.`);

    await Discount.deleteMany({ type_id: typeId });

    return sendSuccess(res, `delete discount type ${typeId} successfully.`);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

export default discountAdminRoute;