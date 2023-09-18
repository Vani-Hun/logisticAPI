import mongoose from "mongoose"
import { METERIAL_MANAGER, PRODUCT_UNIT } from "../constant.js"
const { Schema } = mongoose

const MaterialSchema = new Schema(
    {
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
            default: null
        },
        car_fleet: {
            type: Schema.Types.ObjectId,
            ref: 'car_fleets',
            default: null
        },
        warehouse: {
            type: Schema.Types.ObjectId,
            ref: 'warehouses',
            default: null
        },
        materials: [{
            name: String,
            quantity: Number,
            price: Number,
            unit: {
                type: String,
                enum: Object.values(PRODUCT_UNIT)
            }
        }],
        total_price: Number,
        status: {
            type: String,
            enum: Object.values(METERIAL_MANAGER),
            default: METERIAL_MANAGER.import
        },
        description: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
)

export default mongoose.model('materials', MaterialSchema)
