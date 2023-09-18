import mongoose from "mongoose";
import { TRACKING_STATUS } from "../constant.js";
const { Schema } = mongoose;
const Tracking = Schema(
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'orders',
            required: true
        },
        location: {
            type: Schema.Types.Mixed,
            default: null
        },
        status: {
            type: String,
            default: TRACKING_STATUS.UNKNOWN,
            enum: Object.values(TRACKING_STATUS)
        }
    },
    { timestamps: true }
)

export default mongoose.model('trackings', Tracking)