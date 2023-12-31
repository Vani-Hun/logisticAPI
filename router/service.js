import express from "express";
import { sendError, sendServerError, sendSuccess } from "../helper/client.js";
import DeliveryService from "../model/DeliveryService.js";

const serviceRoute = express.Router();

/**
 * @route GET /api/service
 * @description get service information
 * @access public
 */
serviceRoute.get("/", async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    const { keyword, sortBy, target, tip, name } = req.query;
    var query = {};
    var keywordCondition = keyword
      ? {
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { sub_detail: { $regex: keyword, $options: "i" } },
          { target: { $regex: keyword, $options: "i" } },
          { tip: { $regex: keyword, $options: "i" } },
        ],
      }
      : {};
    if (target) {
      query.target = target;
    }
    if (tip) {
      query.tip = tip;
    }
    if (name) {
      query.name = name;
    }
    if (keyword) {
      query.keyword = keyword;
    }
    if (sortBy) {
      query.sortBy = sortBy;
    }
    const service = await DeliveryService.find({ $and: [query, keywordCondition] })
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`)
      .populate("quotes")
      .populate("features")
      .populate("participants");
    var length = await DeliveryService.find({ $and: [query, keywordCondition] }).count();
    if (service.length == 0)
      return sendError(res, "Service information is not found.");
    if (service)
      return sendSuccess(res, "Get service information successfully.", { length, service });
    return sendError(res, "Service information is not found.");
  } catch (error) {
    return sendServerError(res);
  }
});

/**
 * @route GET /api/service/:id
 * @description get a single service information (get by id or name)
 * @access public
 */
serviceRoute.get("/:id", async (req, res) => {
  try {
    const { id } = await req.params
    const service = await DeliveryService.findById(id)
      .populate("quotes")
      .populate("features")
      .populate("participants");
    return service ? sendSuccess(res, "Get service information successfully.", service) : sendError(res, "Fail.");
  } catch (error) {
    console.log(error)
    return sendServerError(res);
  }
});

export default serviceRoute;
