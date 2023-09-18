import mongoose from "mongoose"
import { BLOG_CATEGORY, IMAGE_DEFAULT } from "../constant.js"
const { Schema } = mongoose

const BlogSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: new Date()
        },
        type: {
            type: String,
            enum: Object.values(BLOG_CATEGORY),
            default: BLOG_CATEGORY.INDUSTRY_NEWS
        },
        picture : {
            type : String,
        },
        paragraphs : [
            {
                type : {
                    content : {
                        type : String,
                    },
                    imgs : [String],
                }
            }
        ]
    },
    { timestamps: true }
)

export default mongoose.model('blogs', BlogSchema)
