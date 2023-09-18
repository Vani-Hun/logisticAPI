import mongoose from "mongoose"
const { Schema } = mongoose


const PostOfficeCodeSchema = new Schema(
    {
        code : {
            type : String,
            require : true,
        },
        index : {
            type : Number,
            default : 0,
        }
    },
    { 
        timestamps: true ,
    }
)

export default mongoose.model('post_office_code', PostOfficeCodeSchema)