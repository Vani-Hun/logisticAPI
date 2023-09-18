import express from "express";
import {
  sendError,
  sendServerError,
  sendSuccess,
} from "../../helper/client.js";
import Bill from "../../model/Bill.js";
import Car from "../../model/Car.js";
import CarFleet from "../../model/CarFleet.js";
import { createCarValidate } from "../../validation/car.js";

const carAdminRoute = express.Router();

/**
 * @route GET /api/admin/car
 * @description get car information
 * @access private
 */
carAdminRoute.get("/", async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    const { car_type, plate, sortBy, keyword } = req.query;
    let query = {};
    let listKeyword = keyword
      ? {
        $or: [
          { plate: { $regex: keyword, $options: "i" } },
          { car_type: { $regex: keyword, $options: "i" } },
        ],
      }
      : {};

    if (car_type) {
      query.car_type = car_type;
    }
    if (plate) {
      query.plate = plate;
    }

    const length = await Car.find({ $and: [query, listKeyword] }).count();
    const listCar = await Car.find({ $and: [query, listKeyword] })
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`);

    if (listCar)
      return sendSuccess(res, "Get car successful.", { length, listCar });
    return sendError(res, "Information not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route GET /api/admin/car/:id
 * @description get about information by id
 * @access private
 */
carAdminRoute.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const cars = await Car.findOne({_id: id});
    if (cars) return sendSuccess(res, "Get car successfully.", cars);
    return sendError(res, "Information not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route POST /api/admin/car
 * @description create about information of car
 * @access private
 */
carAdminRoute.post("/create", async (req, res) => {
  const errors = createCarValidate(req.body);
  if (errors) return sendError(res, errors);

  try {
    const { plate, car_type, volumn, tonnage, car_fleet, seri, expired } =
      req.body;
    const isExist = await Car.exists({ plate });
    const isExistCarfleet = await CarFleet.exists({ _id: car_fleet });
    if (isExist) return sendError(res, "This car plate is already existed.");
    if (!isExistCarfleet)
      return sendError(res, "This car fleet is not existed.");
    else{

      const car = await Car.create({
        plate,
        car_type,
        volumn,
        tonnage,
        car_fleet,
        "insurance.seri": seri,
        "insurance.expired": expired,
      });
      return sendSuccess(res, "set car information successfully.", car);
    }
    
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route PUT /api/admin/car/:id
 * @description update infomation of a existing car
 * @access private
 */
carAdminRoute.put("/:id", async (req, res) => {
  try {
    const { plate, car_type, volumn, tonnage, car_fleet, seri, expired } =
      req.body;
    const { id } = req.params;

    const isExist = await Car.exists({ _id: id });
    if (!isExist) return sendError(res, "ID does not exists");

    const isExistCarfleet = await CarFleet.exists({ _id: car_fleet });
    if (!isExistCarfleet)
      return sendError(res, "This car fleet is not existed.");
    await Car.findByIdAndUpdate(id, {
      plate,
      car_type,
      volumn,
      tonnage,
      car_fleet,
      "insurance.seri": seri,
      "insurance.expired": expired,
    });
    return sendSuccess(res, "Update  successfully", {
      volumn,
      tonnage,
      car_type,
      tonnage,
      car_fleet,
    });
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route DELETE /api/admin/car/:id
 * @description delete a car existing
 * @access private
 */
carAdminRoute.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const isExit = await Car.exists({ _id: id });
    if (!isExit) return sendError(res, "Car does not exist.");

    const data = await Car.findByIdAndRemove(id);
    return sendSuccess(res, "Delete car successfully.", data);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route GET /api/admin/car/:id/fuel_control
 * @description control fuel consumption per car
 * @access private
 */
carAdminRoute.get("/:id/fuel_control", async (req, res) => {
  try {
    const { id } = req.params
    if (!id.match(/^[0-9a-fA-F]{24}$/)) return sendError(res, "car does not exist.")
    const car = await Car.findById(id)
    if (!car) return sendError(res, "Car not found.")
    let fuel_differences = []
    let actual_fuels = 0
    let theoretical_fuels = 0
    const bill = await Bill.find({ car: car.id })
    if (!bill.length) return sendError(res, "Not exists bill with this car. Please create new bill")
    for (let index = 0; index < bill.length; index++) {
      if (!bill[index].actual_fuel) return sendError(res, "Bill not exists actual_fuel. Please add acctual_fuel to the bill")
      if (!bill[index].theoretical_fuel) return sendError(res, "Bill not exists theoretical_fuel. Please add acctual_fuel to the bill")
      actual_fuels = bill[index].actual_fuel
      theoretical_fuels = bill[index].theoretical_fuel

      const fuel_difference = actual_fuels - theoretical_fuels
      console.log(fuel_difference);
      fuel_differences.push(fuel_difference)
    }
    const result = []
    for (let j = 0; j < fuel_differences.length; j++) {
      let data = {}
      if (fuel_differences[j] < 0) {
        data.actual_fuel = actual_fuels
        data.theoretical_fuel = theoretical_fuels
        data.fuel_difference = fuel_differences[j]
        data.message = "nhiên liệu thực tế nhỏ hơn nhiên liệu lý thuyết"
        result.push(data)
      } else {
        data.actual_fuel = actual_fuels
        data.theoretical_fuel = theoretical_fuels
        data.fuel_difference = fuel_differences[j]
        data.message = "nhiên liệu thực tế lớn hơn nhiên liệu lý thuyết"
        result.push(data)
      }
    } return sendSuccess(res, "Get car successfully", result)
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

export default carAdminRoute
