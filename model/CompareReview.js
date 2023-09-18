import mongoose from "mongoose"
import { COMPARE_REVIEW_TYPE } from "../constant.js"
const { Schema } = mongoose

const CompareReviewSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "customers",
            required: true
        },
        order: {
            type: Schema.Types.ObjectId,
            ref: 'orders',
            required: true
        },
        selected_date : { // the date will send gmail to notification
            type : Date,
            required: true
        },
        isSent : {
            type : Boolean,
            default : false,
        },
        schedule_type: {
            type: String,
            enum: Object.values(COMPARE_REVIEW_TYPE),
            default: COMPARE_REVIEW_TYPE.ONCE_A_MONTH,
        },
    },
    { timestamps: true }
)

export default mongoose.model('compare_reviews', CompareReviewSchema)