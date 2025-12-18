import mongoose, { Schema } from "mongoose";

const UserOrderHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.UserOrderHistorySchema ||
  mongoose.model("UserOrderHistorySchema", UserOrderHistorySchema);
