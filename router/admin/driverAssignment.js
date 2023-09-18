import { sendSuccess, sendError, sendServerError } from "../../helper/client.js";
import CarFleet from "../../model/CarFleet.js";
import Staff from "../../model/Staff.js";
import Car from "../../model/Car.js";
import DriverTask from "../../model/DriverTask.js";
import { DRIVER_STATUS, DRIVER_TASK_TYPE } from "../../constant.js";
import Warehouse from "../../model/Warehouse.js";
import DriverProfile from "../../model/DriverProfile.js";

import express from "express";

const driverAssignmentRouter = express.Router();

/**
 * @route GET /api/admin/assign-driver/car-fleets
 * @description get all car_fleets that belong to this admin
 */
driverAssignmentRouter.get("/car-fleets", async (req, res) => {
    if (req.decoded.role !== 'admin') {
        return sendError(res, "you are not admin.");
    }

    const carFleets = await CarFleet.find({ director: req.decoded.roleId});
    if (!carFleets.length) return sendError(res, "you do not have any car fleet.");

    sendSuccess(res, "OK", carFleets);
})

/**
 * @route POST /api/admin/assign-driver/team-member-and-cars
 * @description get all drivers and cars that belong to car_fleet
 */
driverAssignmentRouter.post("/team-member-and-cars", async (req, res) => {
    if (req.decoded.role !== 'admin') {
        return sendError(res, "you are not admin.");
    }

    const carFleetId = req.body.carFleetId;
    if (!carFleetId) {
        return sendError(res, "no carFleetId provided");
    }

    const staffList = await Staff.find({ car_fleet: carFleetId});
    if (!staffList.length) return sendError(res, "there is no driver in this car-fleets")

    const carList = await Car.find({ car_fleet: carFleetId});

    sendSuccess(res, "OK", {staffList, carList});
})

/**
 * @route POST /api/admin/assign-driver/create-assignment
 * @description create working schedule for driver
 */
driverAssignmentRouter.post("/create-assignment", async (req, res) => {
    if (req.decoded.role !== 'admin') {
        return sendError(res, "you are not admin.");
    }
    const adminId = req.decoded.roleId;

    const driverId = req.body.driverId;
    const carPlate = req.body.car;

    if (!driverId) {
        return sendError(res, "no driverId provided.");
    }

    if (!carPlate) {
        return sendError(res, "no car provided.");
    }

    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);

    if (startTime.toString() === "Invalid Date" || endTime.toString() === "Invalid Date") {
        return sendError(res, "no working time provided.");
    }

    if (startTime >= endTime) {
        return sendError(res, "Invalid Time.");
    }

    const warehouseName = req.body.warehouse;
    if (!warehouseName) {
        return sendError(res, "no warehouse provided.");
    }

    const driverTaskType = req.body.driverTaskType;
    if (driverTaskType !== DRIVER_TASK_TYPE.GET_ORDER && driverTaskType !== DRIVER_TASK_TYPE.SEND_ORDER) return sendError(res, "Invalid Task Type."); 

    const driver = await Staff.findById(driverId);
    if (!driver) return sendError(res, "can not find staff.");
    const driverProfile = await DriverProfile.findOne({ staff: driverId});
    if (!driverProfile) {
        console.log("can not find this driver in driver profile.");
        return sendServerError(res);
    }
    if (driverProfile.status !== DRIVER_STATUS.AVAILABLE) return sendError(res, "this driver is not available.");

    const car = await Car.findOne({plate: carPlate});
    if (!car) return sendError(res, "can not find car.");
    const warehouse = await Warehouse.findOne({name: warehouseName});
    if (!warehouse) return sendError(res, "can not find warehouse.");

    if (driver.car_fleet && car.car_fleet) {
        if (driver.car_fleet.toString() !== car.car_fleet.toString()) {
            return sendError(res, "this car does not belong to car_fleet team.");
        }
    } else {
        return sendServerError(res);
    }
    

    const fromWarehouse = req.body.fromWarehouse;
    if (!fromWarehouse) return sendError(res, "no from warehouse provided.");
    const toWarehouse = req.body.toWarehouse;
    if (!toWarehouse) return sendError(res, "no to warehouse provided.");

    const from = await Warehouse.findOne({name: fromWarehouse});
    if (!from) return sendError(res, "can not find warehouse.");
    const to = await Warehouse.findOne({name: toWarehouse});
    if (!to) return sendError(res, "can not find warehouse");

    const fromWarehouseObject = {
        warehouse_id: from._id,
        name: from.name,
        street: from.street,
        province: from.province
    }

    const toWarehouseObject = {
        warehouse_id: to._id,
        name: to.name,
        street: to.street,
        province: to.province
    }
    // create work for staff
    const driverTask = await DriverTask.create({
        type: driverTaskType,
        time_started: startTime,
        time_done: endTime,
        driver: driverId,
        car: car._id,
        comfirmStaff: adminId,
        warehouse: warehouse._id,
        fromWarehouse: fromWarehouseObject,
        toWarehouse: toWarehouseObject
    })

    // change driver status in driver profile
    await DriverProfile.updateOne(
        { staff: driverId },
        { $set: { status: DRIVER_STATUS.DRIVING} }
    )

    sendSuccess(res, "create driver assignment successfull.", driverTask);
})

export default driverAssignmentRouter;