import mongoose from "mongoose"
import { DRIVER_STATUS } from "../constant.js";
const { Schema } = mongoose

const DriverProfileSchema = new Schema (
    {
        staff: {
            type: Schema.Types.ObjectId,
            ref: 'staffs',
            required: true
        },
        license: {
            type: Number,
            required: true
        },
        training_certification: {
            type: String,
            required: true
        },
        driving_experience: {
            type: String,
            required: true
        },
        other_information: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: Object.values(DRIVER_STATUS),
            default: DRIVER_STATUS.UNAVAILABLE,
        }
    },
    { timestamps: true }
)

export default mongoose.model('driver_profiles', DriverProfileSchema)