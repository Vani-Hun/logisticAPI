import mongoose from "mongoose";

const kiosSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        } 
    }, 
    { timestamps: true }
)

export default mongoose.model('kios', kiosSchema)
