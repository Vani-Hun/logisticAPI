import mongoose from "mongoose"
const { Schema } = mongoose

const ContactSchema = new Schema(
    {
        address: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        social_network: [{
            type: Schema.Types.ObjectId,
            ref: 'social_network'
        }],
        hr_mailbox: {
            type: String,
            required: true
        },
        android_app: {
            type: String,
            default: null
        },
        ios_app: {
            type: String,
            default: null
        },
        QR_code: {
            type: String,
            default: null
        },
        top_banner: {
            type: String,
            default: null
        },
        bottom_banner: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model('contactus', ContactSchema)