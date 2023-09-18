import mongoose from "mongoose";

const { Schema } = mongoose;

const CustomerAppointmentSchema = new Schema(
    {
        customer: {
            type: {
                name: {
                    type: String,
                    required: true
                },
                email: {
                    type: String,
                    default: null
                },
                phone: {
                    type: String,
                    required: true
                }
            },
            required: true
        },
        description: {
            type: String,
            required: true
        },
        solved_status: {
            type: Boolean,
            default: false
        },
        time: {
            type: Date,
            required: true,
        }
    },
    { timestamps: true }
);

export default mongoose.model("customer_appointments", CustomerAppointmentSchema);