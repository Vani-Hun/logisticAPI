import mongoose from "mongoose"
const { Schema } = mongoose

const FeeSchema = new Schema(
    {
        VAT: {
            type: Number,
            required: true,
        },
        fuel_fee: {
            type : Number,
            required: true,
        }
    },
    { timestamps: true }
)

export default mongoose.model('fees', FeeSchema)