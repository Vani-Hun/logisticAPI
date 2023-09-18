import mongoose from "mongoose"
const { Schema } = mongoose

const FeatureSchema = new Schema(
    {
        name: {
            type: String,
            unique: true
        },
        logo: {
            type: String,
            default: null
        },
        detail: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model('features', FeatureSchema)