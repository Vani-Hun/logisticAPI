import mongoose from "mongoose"
const { Schema } = mongoose

const AuthOffineSchema = new Schema(
    {
        code: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        expireAt: {
            type: Date,
            default : Date.now(),
            expires: 1 * 24 * 60 * 60, // '1s' - 1 second; '1d' - 1 day
        },
    },
    { timestamps: true }
)

export default mongoose.model('auth_offlines', AuthOffineSchema)