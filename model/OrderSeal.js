import mongoose from "mongoose"
import { ORDER_SEAL_ITEM_STATUS } from "../constant.js"
const { Schema} = mongoose

const OrderSealSchema = new Schema({
    code : {
        type : String,
        required : true,
    },
    isUsed : {
        type : Boolean,
        default : true,
    },
    staffConfirm: {
        type: Schema.Types.ObjectId,
        ref: "staffs",
        required: true,
    },
    warehouse : {
        type: Schema.Types.ObjectId,
        ref: "warehouses",
        required: true,
    },
    num_orders_in_seal : {
        type : Number,
        default : 0,
    },
    orders : [{
        type : {
          orderId : {
            type : String,
            required : true,
          },
          status : {
            type: String,
            enum: Object.values(ORDER_SEAL_ITEM_STATUS),
            default : ORDER_SEAL_ITEM_STATUS.WAITING 
          }, 
          _id : 0, 
        }
    }],
}, {
    timestamps: true
});

export default mongoose.model('orderSeals', OrderSealSchema)