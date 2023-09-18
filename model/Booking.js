import mongoose from "mongoose"
import { PRODUCT_STATUS, PRODUCT_UNIT } from "../constant.js"
const { Schema } = mongoose

const BookingSchema = new Schema(
    {
        customerName: {
            type: String,
            required: true
        },
        contactInfo: {
            type: {
                email: {
                    type: String,
                    required: true
                },
                phone: {
                    type: String,
                    required: true
                }
            }
        },
        pickupAddress: {
            type: String,
            required: true
        },
        deliveryAddress: {
            type: String,
            required: true
        },
        pickupDate: {
            type: Date,
            required: true
        },
        deliveryDate: {
            type: Date,
            required: true
        },
        products: [{
            name: String,
            quantity: Number,
            unit: {
                type: String,
                enum: Object.values(PRODUCT_UNIT),
            },
        }],
        total_price: Number,
        status: {
            type: String,
            enum: Object.values(PRODUCT_STATUS),
            default: PRODUCT_STATUS.pending,
        }
    },
    { timestamps: true }
)

export default mongoose.model('bookings', BookingSchema)