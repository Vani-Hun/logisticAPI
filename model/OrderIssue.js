import mongoose from "mongoose"
import { TypeOfProblem, TypeOfStatusProblem } from "../constant.js"
const { Schema} = mongoose

const OrderIssueSchema = new Schema({
    orderId: {
        type: mongoose.Schema.Types.String,
        ref: 'orders',
        required: true,
    },
    staffConfirm: {
        type: Schema.Types.ObjectId,
        ref: "staffs",
        required: true,
    },
    issueType: {
        type: String,
        enum: Object.values(TypeOfProblem),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(TypeOfStatusProblem),
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    appointment_date: {
        type: String,
        required: false,
    },
    note: {
        type: String,
    },
    image: [String]
}, {
    timestamps: true
});

export default mongoose.model('orderIssues', OrderIssueSchema)