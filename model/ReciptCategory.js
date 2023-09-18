import mongoose from "mongoose"
import { RECEIPT_STATUS } from "../constant.js"
const { Schema } = mongoose

const reciptCategorySchema = new Schema(
    {
        expense_category: {
            type: Schema.Types.ObjectId,
            ref: 'expense_categorys',
            required: true
        },
        staff: {
            type: Schema.Types.ObjectId,
            ref: "staffs",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(RECEIPT_STATUS),
            default: RECEIPT_STATUS.UNCONFIRMED
        }    
    },
    { timestamps: true }
)

export default mongoose.model("recipt_categorys", reciptCategorySchema)