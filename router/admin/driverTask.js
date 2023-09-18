import express from "express"
import { sendError, sendServerError, sendSuccess } from "../../helper/client.js"
import DriverTask from "../../model/DriverTask.js"
import Staff from "../../model/Staff.js"
import Car from "../../model/Car.js"
import Warehouse from "../../model/Warehouse.js"
import PostOffice from "../../model/PostOffice.js"
import { 
    validateCreateDriverTask,
    validateDriverTaskScan,
    validateGetDrivers
} from "../../validation/driverTask.js"
import { DRIVER_TASK_SCAN_TYPE, DRIVER_TASK_STATUS } from "../../constant.js"
import mongoose  from "mongoose"

const driverTaskAdminRoute = express.Router()

/**
 * @route GET /api/admin/driver-task/car-next-destination
 * @description admin get car next destination
 * @access private
 */
driverTaskAdminRoute.get("/car-next-destination", async (req, res) => {
    try {

        const { car_plate } = req.query;
        if (car_plate == null || car_plate === undefined) {
            return sendError(res,'car_plate is required');
        }

        const car = await Car.findOne({plate : car_plate}).lean();
        if (car === null || car === undefined) {
            return sendError(res, `Car - ${car_plate} is not exits`)
        }
        let driverTask = await DriverTask.findOne(
            {car : mongoose.Types.ObjectId(car._id)});

        if (driverTask === null || driverTask === undefined){
            return sendError(res, `driver task for car - ${car_plate} is not exits`)
        }

        let pos = -1;
        for (let i = 0 ;i< driverTask.destinations.length; i++){
            const value = driverTask.destinations[i];
            if (value.time_arrived == null || value.time_arrived == undefined) {
                pos = i;
                break;
            }
        }
        
        if (driverTask.status == DRIVER_TASK_STATUS.DONE){
            return sendSuccess(res, `The car - ${car_plate} is done job`, {
                warehouseId : null,
                postOfficeCode : null,  
            });
        }

        if (pos == -1) {
            return sendSuccess(res, `The car - ${car_plate} will go to warehouse`, {
                warehouseId : driverTask.warehouse,  
                postOfficeCode : null,
            });
        }
        else {
            return sendSuccess(res, `The car - ${car_plate} will go to post office`, {
                warehouseId : null,
                postOfficeCode : driverTask.destinations[pos].postOfficeCode,  
            });
        }
        
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route POST /api/admin/driver-task
 * @description admin create driver task
 * @access private
 */
driverTaskAdminRoute.post("/", async (req, res) => {
    try {
        const errors = validateCreateDriverTask(req.body)
        if (errors) return sendError(res, errors)

        const staffId = req.decoded.roleId;
        const {car_plate, warehouseId, driverCode, type, orderIds, sealCodes, destinations} = req.body;
        
        const _destinations = destinations.split(' ').map((value) => { return { "postOfficeCode": value } })
    
        let car, warehouse, driver;
        await Promise.all([
            Car.findOne({plate : car_plate}).then((value)=> {
                car = value;
                
            }),
            Warehouse.findById(warehouseId).then((value)=> {
                warehouse = value;
               
            }),
            Staff.findOne({code : driverCode}).then((value)=> {
                driver = value;
               
            }),
        ]);

        if (car == null || car == undefined) {
            return sendError(res, `Car - ${car_plate} is not exist`);
        }
        if (warehouse == null || warehouse == undefined) {
            return sendError(res, `Warehouse - ${warehouseId} is not exist`);
        }
        if (driver == null || driver == undefined) {
            return sendError(res, `Driver - ${driverCode} is not exist`);
        }
        let value = {
            type : type,
            car : car._id,
            warehouse : warehouse._id,
            driver : driver._id,
            comfirmStaff : staffId,
            destinations : _destinations,
        }
        if (orderIds != null && orderIds != undefined) {
            value = {
                ...value,
                orderIds : orderIds.split(' '),
            }
        }
        if (sealCodes != null && sealCodes != undefined) {
            value = {
                ...value,
                sealCodes : sealCodes.split(' '),
            }
        }
        const driverTask = await DriverTask.create(value);

        return sendSuccess(res, "create driver task successfully", driverTask);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route PATCH /api/admin/driver-task/scan
 * @description admin scan to update driver task - location
 * @access private
 */
driverTaskAdminRoute.patch("/scan", async (req, res) => {
    try {
        const errors = validateDriverTaskScan(req.body)
        if (errors) return sendError(res, errors)
        const staffId = req.decoded.roleId;
        const {type, warehouseId, postOfficeCode, car_plate } = req.body;
        const time_scan = new Date();
        const car = await Car.findOne({plate : car_plate}).lean();
        if (car === null || car === undefined) {
            return sendError(res, `Car - ${car_plate} is not exits`)
        }
        let driverTask = await DriverTask.findOne(
            {car : mongoose.Types.ObjectId(car._id)});

        if (driverTask === null || driverTask === undefined){
            return sendError(res, `driver task for car - ${car_plate} is not exits`)
        }

        switch(type) {
            case DRIVER_TASK_SCAN_TYPE.CAR_INCOMING_POST_OFFICE:
              if (postOfficeCode == null || postOfficeCode == undefined){
                return sendError(res, 'postOfficeCode is required');
              }
              const postoffice1 = await PostOffice.findOne({code : postOfficeCode});
              if (postoffice1 == null || postoffice1 == undefined) {
                return sendError(res, `Post office - ${postOfficeCode} is not exist`);
              }

              driverTask = await DriverTask.findOneAndUpdate(
                {
                    "destinations.postOfficeCode" : postOfficeCode,
                },
                {
                    $set : {
                        "destinations.$.time_arrived" : time_scan,
                        "destinations.$.comfirmStaff" : staffId,
                    }
                },
              );
              break;
            case DRIVER_TASK_SCAN_TYPE.CAR_LEAVE_POST_OFFICE:
                if (postOfficeCode == null || postOfficeCode == undefined){
                    return sendError(res, 'postOfficeCode is required');
                  }
                const postoffice2 = await PostOffice.findOne({code : postOfficeCode});
                if (postoffice2 == null || postoffice2 == undefined) {
                  return sendError(res, `Post office - ${postOfficeCode} is not exist`);
                }
                driverTask = await DriverTask.findOneAndUpdate(
                    {
                        "destinations.postOfficeCode" : postOfficeCode,
                    },
                    {
                        $set : {
                            "destinations.$.time_arrived" : time_scan,
                            "destinations.$.comfirmStaff" : staffId,
                        }
                    },
                  );
              break;
            case DRIVER_TASK_SCAN_TYPE.CAR_INCOMING_WAREHOUSE:
                if (warehouseId == null || warehouseId == undefined){
                    return sendError(res, 'warehouseId is required');
                  }
                if (driverTask.warehouse != warehouseId) {
                    return sendError(res, `This driver task is not in warehouse - ${warehouseId}`);
                }
                // const warehouse1 = await Warehouse.findById(warehouseId);
                // if (warehouse1 == null || warehouse1 == undefined) {
                //     return sendError(res, `Warehouse - ${warehouseId} is not exist`);
                // }
                driverTask.comfirmStaff_incoming = staffId;
                driverTask.time_done = time_scan;
                driverTask.status = DRIVER_TASK_STATUS.DONE;
                driverTask = await driverTask.save();
                // code block
                break;
            case DRIVER_TASK_SCAN_TYPE.CAR_LEAVE_WAREHOUSE:
                
                if (driverTask.warehouse != warehouseId) {
                    return sendError(res, `This driver task is not in warehouse - ${warehouseId}`);
                }
                // const warehouse2 = await Warehouse.findById(warehouseId);
                // if (warehouse2 == null || warehouse2 == undefined) {
                //     return sendError(res, `Warehouse - ${warehouseId} is not exist`);
                // }
                driverTask.comfirmStaff_leave = staffId;
                driverTask.time_started = time_scan;
                driverTask.status = DRIVER_TASK_STATUS.DOING;
                driverTask = await driverTask.save();
                break;
            default:
              // code block
          }
        return sendSuccess(res, "Scan driver task successfully", driverTask);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});


/**
 * @route GET /api/admin/driver-task/:id
 * @description admin get one driver task
 * @access private
 */
driverTaskAdminRoute.get("/:id", async (req, res) => {
    try {   
        const id = req.params.id;
        if (mongoose.isValidObjectId(id) == false){
            return sendError(res, `id - ${id} is not a valid objectId`)
        }
        const driverTask = await DriverTask.findById(id);
        if (driverTask == null || driverTask == undefined){
            return sendError(res, 'driver task is not exist');
        }
        return sendSuccess(res, "get driver task successfully", driverTask);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route DELETE /api/admin/driver-task/:id
 * @description admin delete one driver task
 * @access private
 */
driverTaskAdminRoute.delete("/:id", async (req, res) => {
    try {   
        const id = req.params.id;
        if (mongoose.isValidObjectId(id) == false){
            return sendError(res, `id - ${id} is not a valid objectId`)
        }
        const driverTask = await DriverTask.findByIdAndRemove(id);
        if (driverTask == null || driverTask == undefined){
            return sendError(res, 'driver task is not exist');
        }
        return sendSuccess(res, "Delete driver task successfully", driverTask);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});

/**
 * @route PUT /api/admin/driver-task/:id
 * @description admin update one driver task
 * @access private
 */
driverTaskAdminRoute.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (mongoose.isValidObjectId(id) == false){
            return sendError(res, `id - ${id} is not a valid objectId`)
        }
        let driverTask = await DriverTask.findById(id);
        if (driverTask == null || driverTask == undefined){
            return sendError(res, 'driver task is not exist');
        }

        const errors = validateCreateDriverTask(req.body)
        if (errors) return sendError(res, errors)

        const staffId = req.decoded.roleId;
        const {car_plate, warehouseId, driverCode, type, orderIds, sealCodes, destinations} = req.body;
        
        const _destinations = destinations.split(' ').map((value) => { return { "postOfficeCode": value } })
    
        let car, warehouse, driver;
        await Promise.all([
            Car.findOne({plate : car_plate}).then((value)=> {
                car = value;
                
            }),
            Warehouse.findById(warehouseId).then((value)=> {
                warehouse = value;
               
            }),
            Staff.findOne({code : driverCode}).then((value)=> {
                driver = value;
               
            }),
        ]);

        if (car == null || car == undefined) {
            return sendError(res, `Car - ${car_plate} is not exist`);
        }
        if (warehouse == null || warehouse == undefined) {
            return sendError(res, `Warehouse - ${warehouseId} is not exist`);
        }
        if (driver == null || driver == undefined) {
            return sendError(res, `Driver - ${driverCode} is not exist`);
        }
        let value = {
            type : type,
            car : car._id,
            warehouse : warehouse._id,
            driver : driver._id,
            comfirmStaff : staffId,
            destinations : _destinations,
        }
        if (orderIds != null && orderIds != undefined) {
            value = {
                ...value,
                orderIds : orderIds.split(' '),
            }
        }
        if (sealCodes != null && sealCodes != undefined) {
            value = {
                ...value,
                sealCodes : sealCodes.split(' '),
            }
        }
        const updateDriverTask  = await DriverTask.findByIdAndUpdate(
            id
        , value, {new: true});

        return sendSuccess(res, "Update driver task successfully", updateDriverTask);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});


/**
 * @route GET /api/admin/driver-task
 * @description admin get list driver task
 * @access private
 */
driverTaskAdminRoute.get("/", async (req, res) => {
    try {
        const errors = validateGetDrivers(req.query)
        if (errors) return sendError(res, errors)

        const {page, pageSize, startDate, endDate, warehouseId, driverId } = req.query;
        
        let filter = {
            createdAt:{$gte: new Date(startDate),$lt: new Date(endDate)}
        };

        if (warehouseId != null && warehouseId != undefined){
            if (mongoose.isValidObjectId(id) == false){
                return sendError(res, `warehouseId - ${id} is not a valid objectId`)
            }
            filter = {
                ...filter,
                warehouse :  mongoose.Types.ObjectId(warehouseId),
            }
        }

        if (driverId != null && driverId != undefined){
            if (mongoose.isValidObjectId(driverId) == false){
                return sendError(res, `warehouseId - ${driverId} is not a valid objectId`)
            }
            filter = {
                ...filter,
                driver :  mongoose.Types.ObjectId(driverId),
            }
        }
        let skipNum = (Number(page) - 1) * Number(pageSize);

        if (skipNum < 0) skipNum = 0;
        const driverTask = await DriverTask.find(filter)
        .skip(skipNum)
        .limit(Number(pageSize));

        return sendSuccess(res, "get driver-tasks successfully", driverTask, driverTask.length);
    } catch (error) {
        console.log(error)
        return sendServerError(res)
    }
});



export default driverTaskAdminRoute