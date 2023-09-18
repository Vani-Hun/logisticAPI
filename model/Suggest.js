import mongoose from "mongoose";
const { Schema } = mongoose;

const SuggestSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "customers",
            required: true
        },

        phone: {
            type: String,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        orderId: {
            type: String,
            required: true
        },

        content: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("suggests", SuggestSchema);