import mongoose from "mongoose";
const { Schema } = mongoose;

const CarTaskSchema = new Schema({
    appear_time: {
        type: Date,
        required: true
    },
    appear_location: {
        type: String,
        required: true
    },
    driverId: {
        type: Schema.Types.ObjectId,
        ref: "staffs",
        default: "none"
    },
    phone: {
        type: String,
        default: "none"
    },
    fuel_consumption: {
        fuel_name: {
            type: String,
            default: "none"
        },
        consumption: {
            type: Number,
            default: 0
        }
    }
},{ timestamps: true })

export default mongoose.model('car_tasks', CarTaskSchema);