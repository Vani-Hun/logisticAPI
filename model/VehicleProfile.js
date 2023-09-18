import mongoose from "mongoose"
const { Schema } = mongoose

const VehicleProfileScheme = new Schema (
    {
        car: {
            type: Schema.Types.ObjectId,
            ref: 'cars',
            required: true
        },
        vehicle_registration: {
            type: Number,
            required: true
        },
        vehicle_type: {
            type: String,
            required: true
        },
        year_of_manufacture: {
            type: Date,
            default: null
        },
        manufacturer: {
            type: String,
            default: null
        },
        mileage: {
            type: Number,
            default: null
        },
        maintenance_schedule: {
            type: Date,
            required: true
        },
        engine_type: {
            type: String,
            default: null
        },
        cylinder_displacement: {
            type: Number,
            default: null
        },
        power: {
            type: Number,
            default: null
        },
        torque: {
            type: Number,
            default: null
        },
        type_of_fuel: {
            type: String,
            required: true
        },
        other_information: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
)

export default mongoose.model('vehicle_profiles', VehicleProfileScheme)