import mongoose from "mongoose"
const { Schema } = mongoose

const KeyTokenSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            require: true,
            ref: "user"
        },
        privateKey: {
            type: String,
            require: true
        },
        publicKey: {
            type: String,
            require: true
        },
        refreshTokenUsed: {
            type: Array,
            default: []
        },
        refreshToken: {
            type: String,
            require: true
        },

    },
    { timestamps: true }
)

export default mongoose.model('keytoken', KeyTokenSchema)