import mongoose from "mongoose"
import { POSITION, INDUSTRY, PROVINCES } from "../constant.js"
const { Schema } = mongoose

const CareerSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        deadline: {
            type: Date,
        },
        salary: {
            type: String,
        },
        workingHours: {
            type: String,
        },
        addressDescription: {
            type: String,
        },
        address: {
            type: String,
            enum: Object.values(PROVINCES),
            default: null
        },
        applicationPosition: {
            type: String,
        },
        industry: {
            type: String,
            enum: Object.values(INDUSTRY),
            default: null
        },
        position: {
            type: String,
            enum: Object.values(POSITION),
            default: null
        },
        benefits: [
            {
                type: String,
            }
        ],
        jobDescription: [
            {
                type: String,
            }
        ],
        jobRequirements: [
            {
                type: String,
            }
        ],
        perks: [
            {
                type: String,
            }
        ],
        isHot: {
            type: Boolean,
            default: false
        },
        isNew: {
            type: Boolean,
            default: false
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        applicants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'applicants'
            }
        ],
    },
    { timestamps: true }
)

export default mongoose.model('careers', CareerSchema)