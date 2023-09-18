import mongoose from "mongoose"
const { Schema } = mongoose

const SocialNetworkSchema = new Schema(
    {
        name: {
            type: String,
        },
        logo: {
            type: String,
        },
        link: {
            type: String,
        }
    },
    { timestamps: true }
)

export default mongoose.model('social_network', SocialNetworkSchema)