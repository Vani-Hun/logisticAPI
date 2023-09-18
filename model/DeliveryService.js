import mongoose from "mongoose"
const { Schema } = mongoose
import Price from './Price.js'

const DeliveryServiceSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        sub_detail: {
            type: String,
            required: true
        },
        introduce: {
            type: String,
            default: null
        },
        target: {
            type: String,
            required: true
        },
          tip: {
            type: String,
            default: null
        },
        quotes: [{
            type: Schema.Types.ObjectId,
            ref: 'quotes'
        }],
        logo: {
            type: String,
            default: null
        },
        banner: {
            type: String,
            default: null
        },
        sub_banner: {
            type: String,
            default: null
        },
        quote_banner: {
            type: String,
            default: null
        },
        video: {
            type: String,
            default: null
        },
        bottom_banner: {
            type: String,
            default: null
        },
        features: [
            {
                type: Schema.Types.ObjectId,
                ref: 'features'
            }
        ],
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: 'participants'
            }
        ],
        price: {
            type: Schema.Types.ObjectId,
            ref: 'prices',
        },
        price_files: [
            {
                province: {
                    type: String,
                    required: true,
                    unique: false
                },
                file: String,
            }
        ],
        profit: {
            type: Number,
            require: true
        }
    },
    { timestamps: true }
)


export default mongoose.model('delivery_services', DeliveryServiceSchema)
