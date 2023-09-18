import mongoose from "mongoose"
const { Schema } = mongoose

const CommitmentSchema = new Schema(
    {
        banner: {
            type: String,
            default: null
        },
        image: {
            type: String,
            default: null
        },
        detail: [
            {
                type: Schema.Types.ObjectId,
                ref: 'sub_commitments',
            }
        ],
    },
    { timestamps: true }
)

export default mongoose.model('commitments', CommitmentSchema)