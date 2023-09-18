import mongoose from "mongoose"
const { Schema } = mongoose

const individualContractSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "customers"
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
            default: null
        },
        id_personal: {
            type: String,
            default: null
        },
        bank_account_holders: {
            type: String,
            default: null
        },
        bank_account_number: {
            type: String,
            default: null
        },
        bank_name: {
            type: String,
            default: null
        },
        bank_branch: {
            type: String,
            default: null
        },
        ID_front_photo: {
            type: String,
            default: null
        },
        ID_back_photo: {
            type: String,
            default: null
        },
        portrait_photo: {
            type: String,
            default: null
        },
    },
    { timestamps: true }
)

export default mongoose.model('individual_Contract', individualContractSchema)