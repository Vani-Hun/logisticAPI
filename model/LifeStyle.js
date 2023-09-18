import mongoose from "mongoose"
const { Schema } = mongoose

const LifeStyleSchema = new Schema(
    {
        imageAboutUs: {
            type: String,
        },
        descriptionAboutUs: [
            {
                type: String,
            }
        ],
        containerImage: [
            {
                type: String,
            }
        ],
    },
    { timestamps: true }
)

export default mongoose.model('lifeStyles', LifeStyleSchema)
