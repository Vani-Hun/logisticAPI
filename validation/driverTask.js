import { DRIVER_TASK_SCAN_TYPE, DRIVER_TASK_TYPE } from "../constant.js"
import Error from "../helper/error.js"

export const validateCreateDriverTask = data => {
    const error = new Error()
    error.isRequired(data.type, 'type')
    .isInRangeName(data.type, DRIVER_TASK_TYPE, 'type')

    error.isRequired(data.car_plate, 'car_plate')
    error.isRequired(data.warehouseId, 'warehouseId')
    .checkMongoId(data.warehouseId,'warehouseId')
    
    error.isRequired(data.driverCode, 'driverCode')
    error.isRequired(data.destinations, 'destinations') 
    return error.get()
} 


export const validateDriverTaskScan = data => {
    const error = new Error()
    error.isRequired(data.type, 'type')
    .isInRangeName(data.type, DRIVER_TASK_SCAN_TYPE, 'type')

    error.isRequired(data.car_plate, 'car_plate')
    return error.get()
}



export const validateGetDrivers = data => {
    const error = new Error()
    error.isRequired(data.page, 'page')
    error.isRequired(data.pageSize, 'pageSize')
    error.isRequired(data.startDate, 'startDate')
    error.isRequired(data.endDate, 'endDate')
    return error.get()
}