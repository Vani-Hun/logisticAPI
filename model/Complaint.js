import mongoose from "mongoose"
const { Schema } = mongoose

const ComplaintSchema = new Schema(
    {
        message: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model('complaints', ComplaintSchema)
