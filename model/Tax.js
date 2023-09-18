import mongoose from "mongoose"
import { TAX_TYPE } from "../constant.js"
const { Schema } = mongoose

const TaxSchema = new Schema(
    {
        code: {
            type: String,
            unique: true
        },
        name: {
            type: String,
            enum: Object.values(TAX_TYPE),
            required: true,
            default: TAX_TYPE.VALUE_ADDED
        },
        cost: {
            type: String,
            required: true
        },
        note: {
            type: String
        }
    },
    { timestamps: true }
)

export default mongoose.model('taxes', TaxSchema)