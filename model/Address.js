import mongoose from "mongoose";
const { Schema } = mongoose;

const AddressSchema = new Schema({
    _id: {
        type: Schema.Types.ObjectId,
        required: true,
        auto: true,
    },
    customer_id: {
        type: Schema.Types.ObjectId,
        ref: 'customers',
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        default: null,
    },
    address: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        default: null,
    },
    default_address: {
        type: Boolean,
        default: false,
    },
});

export default mongoose.model("addresses", AddressSchema);

