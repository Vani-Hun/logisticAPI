import mongoose from "mongoose"
const { Schema } = mongoose

const DocumentSchema = new Schema (
    {
        order: {
            type: Schema.Types.ObjectId,
            ref: 'orders',
            required: true
        },
        product: {
            type: Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        value: {
            type: String,
            required: true
        },
        delivery_time: {
            type: Date,
            required: true
        },
        receiving_time: {
            type: Date,
            required: true
        },
        transport_means: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model('documents', DocumentSchema)