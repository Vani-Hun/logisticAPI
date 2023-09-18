import mongoose from "mongoose"
const { Schema } = mongoose

const OtpSchema = new Schema(
    {
        email: {
            type : String,
        },
        phone: {
            type : String,
        },
        otp : {
            type : String,
        },
        time: {
            type : Date,
            default : Date.now,
            index : {
                expires: 20
            }
        }
    },
)

export default mongoose.model('otps', OtpSchema)

