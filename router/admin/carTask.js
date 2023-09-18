import { STAFF } from "../../constant.js";
import { sendError, sendSuccess } from "../../helper/client.js";
import CarTask from "../../model/CarTask.js";
import Staff from "../../model/Staff.js";

import express from "express";

const carTaskRouter = express.Router();

/**
 * @route POST /api/admin/car-task
 * @description car task and fuel consumption
 */
carTaskRouter.post("/", async (req, res) => {
    if (req.decoded.role !== 'admin') {
        return sendError(res, "you are not admin.");
    }

    const {appearingTime, appearingLocation, driverId, phone, fuelName, consumption} = req.body;

    if (!appearingTime) {
        return sendError(res, "no appearing time provided.");
    }
    const appearTime = new Date(appearingTime);
    if (appearTime.toString() === "Invalid Time".toString()) {
        return sendError(res, "Invalid Appearing Time");
    }

    if (!appearingLocation) {
        return sendError(res, "no appearing location provided.");
    }

    if (!driverId) {
        return sendError(res, "no driver id provided.");
    }
    const driver = await Staff.findById(driverId);
    console.log(driver.staff_type.toString() === STAFF.DRIVER.toString());
    if (!driver && driver.staff_type.toString() !== STAFF.DRIVER.toString()) {
        return sendError(res, "can not find this driver");
    }

    const fuelInfo = {
        fuel_name: fuelName,
        consumption: consumption
    }

    const carTask = await CarTask.create({
        appear_time: appearingTime,
        appear_location: appearingLocation,
        driverId: driverId,
        phone: phone,
        fuel_consumption: fuelInfo
    })

    sendSuccess(res, "create car task successfully.", carTask);
})

export default carTaskRouter;