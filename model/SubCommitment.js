import mongoose from "mongoose"
const { Schema } = mongoose

const SubCommitmentSchema = new Schema(
    {
        logo: {
            type: String
        },
        name: {
            type: String
        },
        description: {
            type: String
        },
    },
    { timestamps: true }
)

export default mongoose.model('sub_commitments', SubCommitmentSchema)