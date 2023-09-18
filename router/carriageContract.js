import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import { verifyCustomer, verifyToken } from "../middleware/verify.js";
import CarriageContract from "../model/CarriageContract.js";
import User from "../model/User.js";

const carriageContractRoute = express.Router();

/**
 * @route GET /api/carriageContract/:id
 * @description get carriageContract information
 * @access public
 */
carriageContractRoute.get("/:id",
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.decoded.userId);
      if (!user) {
          return sendError(res, "User not found", 404);
      }
      const { id } = req.params;

      const carriageContract = await CarriageContract.findById({ _id: id });
      if (!carriageContract) return sendError(res, "carriageContract does not exist!");

      if (carriageContract) return sendSuccess(res, "get carriageContract information successfully.", carriageContract);
      return sendError(res, "carriageContract information is not found.");
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
  })

/**
 * @route GET /api/carriageContract
 * @description get carriageContract information
 * @access public
 */

carriageContractRoute.get("/",
  verifyToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.decoded.userId);
      if (!user) {
          return sendError(res, "User not found", 404);
      }
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
      const page = req.query.page ? parseInt(req.query.page) : 0;
      const { car_maintenance, keyword, sortBy } = req.query;
      var query = {};
      var keywordCondition = keyword
        ? {
          $or: [
            { car_maintenance: { $regex: keyword, $options: "i" } },
            { type_fee: { $regex: keyword, $options: "i" } },
            { fuel_Fee: { $regex: keyword, $options: "i" } },
          ],
        }
        : {};
      if (car_maintenance) {
        query.car_maintenance = car_maintenance;
      }
      const carriageContract = await CarriageContract.find({ $and: [query, keywordCondition] })
        .limit(pageSize)
        .skip(pageSize * page)
        .sort(`${sortBy}`);
      var length = await CarriageContract.find({ $and: [query, keywordCondition] }).count();
      if (carriageContract)
        return sendSuccess(res, "Get carriageContract information successfully.", {
          length,
          carriageContract,
        });
      return sendError(res, "carriageContract information is not found.");
    } catch (error) {
      console.log(error);
      return sendServerError(res);
    }
  })

export default carriageContractRoute