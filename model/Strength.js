import mongoose from "mongoose"
const { Schema } = mongoose

const StrengthSchema = new Schema(
    {
        name: {
            type: String
        },
        sub_name: {
            type: String
        },
        detail: {
            type: String
        },
        description: {
            type: String
        },
        link: {
            type: String
        },
        logo: {
            type: String
        },
        isPublicHomePage: {
            type: Boolean,
            default: false
        },
        isPublicAboutUs: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
)

export default mongoose.model('strengths', StrengthSchema)