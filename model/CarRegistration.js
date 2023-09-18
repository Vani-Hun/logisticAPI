import mongoose from "mongoose"

const { Schema } = mongoose;

const CarRegistrationSchema = new Schema(
    {
        car: {
            type: Schema.Types.ObjectId,
            ref: "cars",
            required: true
        },
        registration_date: {
            type: Date,
            required: true
        },
        expiration_date: {
            type: Date,
            required: true
        },
        fee: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        },
        note: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model("carregistration", CarRegistrationSchema)