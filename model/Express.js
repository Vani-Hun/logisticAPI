import mongoose from "mongoose"
const { Schema } = mongoose

const ExpressSchema = new Schema(
    {
         FastFee: {
            type: [{
                province: {
                    level1_id: String,
                    name: String,
                    type: String,
                    code_area: String
                },
                level2s: [{
                    level2_id: String,
                    cost: [Number],
                    range: String
                }],
                cities: [{
                    code_name: String,
                    code_area: String
                }],
            }]
        },
        Standard: {
            type: [{
                province: {
                    level1_id: String,
                    name: String,
                    type: String,
                    code_area: String
                },
                level2s: [{
                    level2_id: String,
                    cost: [Number],
                    range: String
                }],
                cities: [{
                    code_name: String,
                    code_area: String
                }],
            }]
        },
        SuperFee: {
            type: [{
                province: {
                    level1_id: String,
                    name: String,
                    type: String,
                    code_area: String
                },
                level2s: [{
                    level2_id: String,
                    costIn: [Number],
                    costOut: [Number],
                    range: String
                }],
                cities: [{
                    code_name: String,
                    code_area: String,
                    In: String,
                    Out: String,
                }],
            }]
        },
    },
    { timestamps: true }
)

export default mongoose.model('shipping_price_lists', ExpressSchema)