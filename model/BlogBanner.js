import mongoose from "mongoose"
const { Schema } = mongoose

const BlogBannerSchema = new Schema(
    {
        imgs : [String],
    },
)

export default mongoose.model('BlogBanners', BlogBannerSchema)
