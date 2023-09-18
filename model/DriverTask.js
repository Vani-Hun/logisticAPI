import mongoose from "mongoose"
import { DRIVER_TASK_STATUS, DRIVER_TASK_TYPE } from "../constant.js"
import Warehouse from "./Warehouse.js"
const { Schema } = mongoose

const DriverTaskSchema = new Schema (
    {   
        type: {
            type: String,
            enum: Object.values(DRIVER_TASK_TYPE),
            required: true
        },
        status: {
            type: String,
            enum: Object.values(DRIVER_TASK_STATUS),
            default : DRIVER_TASK_STATUS.NOT_STARTED,
        },
        time_started : {
            type : Date,
        },
        time_done : {
            type : Date,
        },
        comfirmStaff_incoming: {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
        },
        comfirmStaff_leave: {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
        },
        driver: {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
            required: true
        },
        car : {
            type: Schema.Types.ObjectId,
            ref: 'cars',
            required: true
        },
        // who create driver task
        comfirmStaff : {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
            required: true
        },
        warehouse : {
            type: Schema.Types.ObjectId,
            ref: 'warehouses',
            required: true
        },
        fromWarehouse: {
            type: {
                warehouse_id: {
                    type: Schema.Types.ObjectId,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                street: {
                    type: String,
                    required: true,
                },
                province: {
                    type: String,
                    required: true,
                },
            },
            required: true,
        },
        toWarehouse: {
            type: {
                warehouse_id: {
                    type: Schema.Types.ObjectId,
                    required: true,
                },
                name: {
                    type: String,
                    required: true,
                },
                street: {
                    type: String,
                    required: true,
                },
                province: {
                    type: String,
                    required: true,
                },
            },
            required: true,
        },
        sealCodes : [String],// required if type = send_order
        orderIds : [String], // required if type = get_order
        // the driver will go in the order of the array
        destinations : [{
            type : {
                postOfficeCode : {
                    type : String,
                },
                time_arrived : {
                    type : Date,
                },
                time_left : {
                    type : Date,
                },
                // who scan to comfirm driver come/leave location
                comfirmStaff : {
                    type: Schema.Types.ObjectId,
                    ref: 'staffs',
                },
                _id : 0,
            }
        }]
    },
    { timestamps: true }
)

export default mongoose.model('driver_tasks', DriverTaskSchema)