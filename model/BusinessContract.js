import mongoose from "mongoose"
const { Schema } = mongoose

const businessContractSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "customers"
        },
        company_name: {
            type: String,
            require: true
        },
        name: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        area: {
            type: String,
            required: true
        },
        address: {
            type: String,
            require: true
        },
        email: {
            type: String,
            require: true
        },
        position: {
            type: String,
            require: true
        },
        tax_code: {
            type: String,
            require: true
        },
        bank_account_holders: {
            type: String,
            require: true
        },
        bank_account_number: {
            type: String,
            require: true
        },
        bank_name: {
            type: String,
            require: true
        },
        bank_branch: {
            type: String,
            require: true
        },
        ID_front_photo: {
            type: String,
            require: true
        },
        ID_back_photo: {
            type: String,
            require: true
        },
        portrait_photo: {
            type: String,
            require: true
        },
    },
    { timestamps: true }
)

export default mongoose.model('business_Contract', businessContractSchema)