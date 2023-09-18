import mongoose from "mongoose"
const { Schema } = mongoose

const expenseCategorySchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

export default mongoose.model('expense_categorys', expenseCategorySchema)