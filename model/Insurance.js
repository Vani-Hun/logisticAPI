import mongoose from "mongoose"
const { Schema } = mongoose

const InsuranceSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        type_of_insurance: {
            type: String,
            required: true
        },
        company: {
            type: String,
            required: true
        },
        department: {
            type: Schema.Types.ObjectId,
            require: true,
            ref: 'deparment'
        },
        cost: {
            type: String,
            default: 0
        },
        note: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model('insurance', InsuranceSchema)