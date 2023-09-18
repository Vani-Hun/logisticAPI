import mongoose from "mongoose"
const { Schema } = mongoose

const TaxSchema = new Schema(
    {
        warehouse: {
            type: String,
            required: true
        },
        tax: {
            type: String,
            required: true
        },
        insurance: {
            type: String,
            require: true
        },
        staff: {
            type: String,
            required: true
        },
        delivery: {
            type: String,
            require: true
        }
    },
    { timestamps: true }
)

export default mongoose.model('tax', TaxSchema)