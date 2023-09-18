import express from "express";
import {
  sendError,
  sendServerError,
  sendSuccess,
} from "../../helper/client.js";
import CarFleet from "../../model/CarFleet.js";
import { carFleetValidate } from "../../validation/carFleet.js";
import Car from "../../model/Car.js";
import Bill from "../../model/Bill.js";
import Staff from "../../model/Staff.js";
import ProductShipment from "../../model/ProductShipment.js";
import Product from "../../model/Product.js";
import Error from "../../helper/error.js";
import mongoose from "mongoose";

const carFleetAdminRoute = express.Router();

/**
 * @route POST /api/admin/carFleet/
 * @description register new carFleet
 * @access private
 */
carFleetAdminRoute.post("/", async (req, res) => {
  const errors = carFleetValidate(req.body);
  if (errors) return sendError(res, errors);

  let { name, director } = req.body;

  try {
    const isExist = await CarFleet.exists({ name });
    if (isExist) {
      return sendError(res, "Name already exists.");
    }
    if (mongoose.isValidObjectId(director) == false) {
      return sendError(res, `${director} is not valid objectId mongoose`); 
    }
    const staff = await Staff.findById(director);
    if (staff == null || staff == undefined) {
      return  sendError(res, `Staff - ${director} is not exist`); 
    }
    const carFleet = await CarFleet.create({
      name,
      director,
    });
    return sendSuccess(res, "CarFleet registered successfully.", carFleet);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
  
});

/**
 * @route PUT /api/admin/admin/carFleet/:id
 * @description update details of an existing carFleet
 * @access private
 */
carFleetAdminRoute.put("/:id", async (req, res) => {
  const { id } = req.params;
  const errors = carFleetValidate(req.body);
  if (errors) return sendError(res, errors);
  let { director } = req.body;
  try {
    const carFleet = await CarFleet.exists({ id });
    if (carFleet) {
      await CarFleet.findByIdAndUpdate(id, {
        director: director,
      });
      return sendSuccess(res, "Update carFleet successfully.", {
        director: director,
      });
    }
    return sendError(res, "CarFleet does not exist.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route DELETE /api/admin/admin/carFleet/:id
 * @description delete an existing carFleet
 * @access private
 */
carFleetAdminRoute.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const isExist = await CarFleet.exists({ _id: id });
    if (!isExist) return sendError(res, "CarFleet does not exist.");
    await Car.remove({ car_fleet: id });
    const carFleet = await CarFleet.findByIdAndRemove(id);
    return sendSuccess(res, "Delete carFleet successfully.", carFleet);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route GET /api/admin/carFleet/car/:carFleetId
 * @description get a single car turnover information
 * @access public
 */
carFleetAdminRoute.get("/car/:plate", async (req, res) => {
  const { plate } = req.params;
  try {
    const car = await Car.findOne({ plate: plate });
    if (!car) return sendError(res, "car does not exist.");
    const bill = await Bill.find({ car: car });
    if (!bill.length) return sendError(res, "Bill does not exist.");
    let turnover = 0;
    if (bill[0].product_shipments.length) {
      for (let i = 0; i < bill[0].product_shipments.length; i++) {
        turnover += bill[0].product_shipments[i].turnover;
      }
    }
    if (turnover)
      return sendSuccess(res, "get car turnover information successfully.", {
        turnover,
        car,
      });
    return sendError(res, "car turnover information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
});

/**
 * @route GET /api/admin/carFleet/:name
 * @description get all cars in fleet turnover information
 * @access public
 */
carFleetAdminRoute.get("/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0;
    const page = req.query.page ? parseInt(req.query.page) : 0;
    const { sortBy } = req.query;
    const carFleet = await CarFleet.findOne({ name: name }).populate("bills");
    if (!carFleet) return sendError(res, "carFleet does not exist.");
    const cars = await Car.find({ car_fleet: carFleet })
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`);
    let length = await Car.find({ car_fleet: carFleet }).count();
    if (!cars) return sendError(res, "car does not exist.");
    const bills = carFleet.bills;
    if (!bills) return sendError(res, "Bill does not exist.");
    let turnover = 0;
    for (let j = 0; j < bills.length; j++) {
      for (let i = 0; i < bills[j].product_shipments.length; i++) {
        if (bills[j].product_shipments.length) {
          turnover += bills[j].product_shipments[i].turnover;
        }
      }
    }
    if (turnover) {
      const name = carFleet.name;
      const director = await Staff.findOne({ _id: carFleet.director });
      return sendSuccess(res, "get cars turnover information successfully.", {
        name,
        director,
        length,
        turnover,
        cars,
      });
    }
    return sendError(res, "cars turnover information is not found.");
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route GET /api/admin/carfleet?name=name&pageSize=number&page=number
 * @description get single, all & cost_car_Fleet the bills' actual fuel projection has been completed.
 * @access private
 */
carFleetAdminRoute.get("/:costCarFleet", async (req, res) => {
  try {
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 0
    const page = req.query.page ? parseInt(req.query.page) : 0
    const { name, sortBy, keyword } = req.query
    let query = {}
    let listKeyword = keyword ? {
      $or: [
        { name: { $regex: keyword, $options: "i" } }
      ]
    } : {};

    if (name) {
      query.name = name;
    }

    const length = await CarFleet.find({ $and: [query, listKeyword] }).count()
    let listCarFleet = await CarFleet.find({ $and: [query, listKeyword] })
      .populate('bills')
      .limit(pageSize)
      .skip(pageSize * page)
      .sort(`${sortBy}`)

    let total = 0
    let carsFleet = []
    listCarFleet.forEach((carFleet) => {
      let costCarFleet = 0
      carFleet.bills.forEach((bill) => {
        if (bill.status === 'completed' && bill.current_fuel_price && bill.current_fuel_price !== null) {
          costCarFleet += bill.actual_fuel * bill.current_fuel_price
          total += bill.actual_fuel * bill.current_fuel_price
        }
      })
      const teamCar = { ...carFleet._doc, costCarFleet }
      return carsFleet.push(teamCar)
    })

    if (listCarFleet)
      return sendSuccess(res, "Get car fleet successfully.", {
        length,
        totalCostCarFleet: total,
        carsFleet
      })
    return sendError(res, "Information not found.")
  } catch (error) {
    console.log(error)
    return sendServerError(res)
  }
})

/**
 * @route GET /api/admin/carFleet/:carFleetId/inventory
 * @description get inventory of car fleet
 * @access public
 */

carFleetAdminRoute.get("/:carFleetId/inventory", async (req, res) => {
  try {
    //get car fleet by id
    const { carFleetId } = req.params

    //check id valid
    let err = new Error;
    if (!err.checkId(carFleetId)) return sendError(res, "Id is not valid.");

    //Find carfleet by id
    const carFleet = await CarFleet.findById(carFleetId)
    if (!carFleet) return sendError(res, "carFleet does not exist.");

    //get list bills belong to car fleet
    const listBill = carFleet.bills
    if (!listBill) return sendError(res, "Bill does not exist.");

    const result = []

    for (let i = 0; i < listBill.length; i++) {
      //get one bill which status is waiting or processing
      const billId = listBill[i]

      const bill = await Bill.findOne({ _id: billId, status: { $in: ["waiting", "processing"] } })

      //get list product shipments belong to that bill
      const product_shipments = bill.product_shipments

      for (let j = 0; j < product_shipments.length; j++) {
        //get info of one product shipment include: name of product, quantity, unit, shipment id
        //and add to result
        let data = {}
        if (product_shipments[j]) {
          let shipmentId = product_shipments[j].shipment
          let shipment = await ProductShipment.findById(shipmentId)
          let product = await Product.findOne({ product_shipments: shipmentId })
          data.shipment = shipmentId
          data.product_name = product.name
          data.quantity = shipment.quantity
          data.unit = product.unit
          result.push(data)
        }
      }
    }
    return sendSuccess(res, "get inventory of car fleet successfully", result)
  }
  catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

/**
 * @route GET /api/admin/carFleet
 * @description get all cars in fleet turnover information
 * @access public
 */
carFleetAdminRoute.get("/", async (req, res) => {
  try {
    const cars = await CarFleet.find();
    let arrayCar = [];
    cars.forEach((car) => {
      let info = {
        id: car._id,
        name: car.name
      }
      arrayCar.push(info);
    });
    return sendSuccess(res, "Get car fleet successfully", arrayCar);
  } catch (error) {
    console.log(error);
    return sendServerError(res);
  }
})

export default carFleetAdminRoute
