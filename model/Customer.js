import mongoose from "mongoose"
import { CUSTOMER, CUSTOMER_RANK } from "../constant.js"
const { Schema } = mongoose

const CustomerSchema = new Schema(
    {
        name: {
            type: String,
        },
        area: {
            type: String
        },
        address: {
            type: String
        },
        description: {
            type: String,
            default: null
        },
        customer_type: {
            type: String,
            enum: Object.values(CUSTOMER),
            default: CUSTOMER.PASSERS,
            required: true
        },
        rank_passers: {
            type: {
                point: Number,
                level: {
                    type: String,
                    enum: Object.values(CUSTOMER_RANK)
                }
            },
            default: {
                point: 0,
                level: CUSTOMER_RANK.UNRANK
            }
        },
        companyTaxcode_business: {
            type: String,
            default: null
        },
        name_product: {
            type: String,
        },
        quantity_order: {
            type: Number,
        },
        child_account:{
            type: Array,
        },
        bank_name: {
            type: String,
        },
        bank_account_number: {
            type: String,
            default: null
        },
        branch: {
            type: String,
            default: null
        },
        bank_account_owner_name: {
            type: String,
            default: null
        },
        identity_card_number: {
            type: String,
            default: null
        },
        identity_card_front_image: {
            type: String,
            default: null
        },
        identity_card_back_image: {
            type: String,
            default: null
        }
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
)
CustomerSchema.virtual("orders", {
    ref: "orders",
    localField: "_id",
    foreignField: "customer",
});

// CustomerSchema.virtual('classification').get(function() {
//     let total = 0;

//     // Calculate the total price of all orders for the customer
//     for (const order of this.orders) {
//       total += order.total_price;
//     }

//     // Calculate the number of days since the account was created
//     const daysSinceAccountCreation = (new Date() - this.createdAt) / (1000 * 60 * 60 * 24);
//     this.daysSinceAccountCreation = daysSinceAccountCreation

//     // Determine the customer classification based on the total order amount and account age
//     if (daysSinceAccountCreation < 30 && total === 0) {
//       return 'New Customer';
//     } else if (daysSinceAccountCreation >= 30 && total >= 1000000) {
//       return 'Vip Customer';
//     } else if (daysSinceAccountCreation >= 360) {
//       return 'Old Customer';
//     } else {
//       return 'Normal Customer';
//     }
//   });

export default mongoose.model('customers', CustomerSchema)