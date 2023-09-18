import mongoose from "mongoose"
const { Schema } = mongoose
import Order from "./Order.js"
const PostOfficeSchema = new Schema(
    {
        // format : AAABBCCC
        // AAA is province code
        // BB is district code
        // CCC is the CCC th post office in AAA provice, BB district
        code: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        district: {
            type: String,
            required: true
        },
        ward: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }
    }
)

export default mongoose.model('post_offices', PostOfficeSchema)

