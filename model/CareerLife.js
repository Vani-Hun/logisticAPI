import mongoose from "mongoose"
import { POSITION } from "../constant.js"
const { Schema } = mongoose

const CareerLifeSchema = new Schema(
    {
        topPicture: {
            type: String,
            required: true
        },
        rightPicture: {
            type: String,
            required: true
        },
        nameLife: {
            type: String,
            required: true
        },
        contentLife: {
            type: String,
            required: true
        },
        descriptionLife: {
            type: String,
            required: true
        },
        nameTeammatePortrait: {
            type: String,
            required: true
        },
        logoTeammatePortrait: {
            type: String,
            required: true
        },
        teammatePortrait: [
            {
                type: Schema.Types.ObjectId,
                ref: 'strengths',
            }
        ],
        address: {
            logo: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            detail: {
                type: String,
                required: true
            },
        },
        info: [
            {
                logo: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                content: {
                    type: String,
                    required: true
                },
            }
        ],
        bottomPicture: [
            {
                background: {
                    type: String,
                    required: true
                },
                logo: {
                    type: String,
                    required: true
                },
                content: {
                    type: String,
                    required: true
                },
                name: {
                    type: String,
                    required: true
                },
                position: {
                    type: String,
                    required: true
                },
            }
        ],
    },
    { timestamps: true }
)

export default mongoose.model('career_lives', CareerLifeSchema)