import mongoose from "mongoose"
import { SHIPMENT_MANAGER } from "../constant.js"
const { Schema } = mongoose

const WarehouseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        ward: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        storekeeper: {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
            default: null
        },
        turnover: {
            type: Number,
            default: 0,
        },
        inventory_product_shipments: [
            {
                shipment: {
                    type: Schema.Types.ObjectId,
                    ref: 'product_shipments'
                },
                turnover: {
                    type: Number,
                    required: true
                },
                status: {
                    type: String,
                    enum: Object.values(SHIPMENT_MANAGER),
                    default: SHIPMENT_MANAGER.import,
                    required: true
                }
            },
            { timestamps: true }
        ],
        total_operating_costs: {
            type: Number,
            default: 0,
        },
        operating_costs: {
            warehouse_rental_costs: {
                type: Number,
                default: 0
            },
            cost_of_electricity: {
                type: Number,
                default: 0
            },
            maintenance_costs: {
                type: Number,
                default: 0
            },
            equipment_cost: {
                type: Number,
                default: 0
            },
            othercost: {
                type: Number,
                default: 0
            }
        },

    },
    { timestamps: true }
)

export default mongoose.model('warehouses', WarehouseSchema)