import mongoose from "mongoose";
import { CUSTOMER_RANK } from "../constant.js";
const { Schema } = mongoose;

const DiscountSchema = new Schema({
  type_id: {
    type: String,
    default:
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
  },
  customer_id: {
    type: Object,
    ref: 'customers',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  rank: {
    type: String,
    enum: CUSTOMER_RANK,
    default: CUSTOMER_RANK[Math.floor(Math.random() * CUSTOMER_RANK.length)]
  },
  description: {
    type: String,
  },
  discount: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  status: {
    type: Boolean,
    default: true,
  },
  start_date: {
    type: Date,
    default: Date.now,
  },
  end_date: {
    type: Date,
    default: Date.now,
  },
});

// delete discount on put request
DiscountSchema.pre("findOneAndUpdate", async function (next) {
  if (!this._update.status) {
    await this.model.findOneAndDelete({
      _id: this._conditions._id
    });
    return next();
  }

  return next();
});

export default mongoose.model("discounts", DiscountSchema);
