import mongoose from "mongoose";
import { PRODUCT_STATUS, PRODUCT_UNIT, ISSUES_TYPE, PRODUCT_TYPE } from "../constant.js";
const { Schema } = mongoose;

const ProductSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: String,
            required: true
        },
        types: {
            type: String,
            enum: Object.values(PRODUCT_TYPE),
            required: true
        },
        goods_value: {
            type: String,

        },
        unit: {
            type: String,
            enum: Object.values(PRODUCT_UNIT),
            required: true
        },
        weight: {
            type: String,
            required: true
        },
        other: {
            type: String,
        },
        service: {
            type: String,
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'orders',
            required: true
        },
        note: {
            type: String,
            default: null
        },
        product_shipments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'product_shipments'
            }
        ],
        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            required: true,
            default: PRODUCT_STATUS.pending
        },
    },
    { timestamps: true }
)

export default mongoose.model("products", ProductSchema);
