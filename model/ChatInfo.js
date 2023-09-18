import mongoose from "mongoose"
const { Schema } = mongoose

const ChatInfoSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true
        },
        online_service_time: {
            type: String,
            required: true
        },
        logo_chat: {
            type: String,
            required: true
        },
        greeting_chat: {
            type: String,
            required: true
        },
        suggest_chat: [String],
        hot_chat: [String],
        leftBanner: {
            type: String,
            required: true
        },
        rightStrength: [
            {
                type: Schema.Types.ObjectId,
                ref: 'strengths',
            }
        ],
    },
    { timestamps: true }
)

export default mongoose.model('chat_infos', ChatInfoSchema)