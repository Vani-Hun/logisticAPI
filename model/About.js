import mongoose from "mongoose"
const { Schema } = mongoose

const AboutSchema = new Schema(
    {
        name: {
            type: String
        },
        description: {
            type: String
        },
        vision: {
            type: String
        },
        values: {
            type: String
        },
        logo: {
            type: String,
            default: null
        },
        banners: {
            type: Array,
            default: null
        },
        topBanner: {
            type: String,
            default: null
        },
        midBanner: {
            type: String,
            default: null
        },
        appBanner: {
            type: String,
            default: null
        },
        video: {
            type: String
        },
        bottomBanner: {
            type: String,
            default: null
        },
        history: {
            type: String
        },
        networkCoverage: {
            type: String
        },
        strengths: [
            {
                type: Schema.Types.ObjectId,
                ref: 'strengths',
            }
        ],
        businessLicense: {
            type: String
        },
        licenseOrgan: {
            type: String
        },
        license_img: {
            type: String
        },
        licenseDetail: {
            type: String
        },
        searchBanner: {
            type: String,
            default: null
        }

    },
    { timestamps: true }
)

export default mongoose.model('aboutus', AboutSchema)