import mongoose, { Schema, Types } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: {
      type: String, // Changed from Types.ObjectId to handle string IDs
      required: true,
      refPath: "items.itemModel",
    },
    itemModel: {
      type: String,
      required: true,
      enum: ["Product", "VendingItem"],
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      enum: ["STORE", "VENDING"],
      required: true,
    },
    sourceId: {
      type: String, // Changed from Types.ObjectId to handle string IDs (e.g. "69")
      required: true,
      refPath: "items.sourceModel",
    },
    sourceModel: {
      type: String,
      required: true,
      enum: ["Store", "VendingMachine"],
    },
    isSettled: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [OrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    userName: {
      type: String, // Snapshot of name at time of order
    },
    userPhone: {
      type: String, // Snapshot of phone
    },
    address: {
      type: String, // Hostel
    },
    roomNumber: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "PENDING",
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
    },
  },
  { timestamps: true, strict: false }
);

// Force recompilation if schema changed (Development helper)
// if (process.env.NODE_ENV === 'development') {
//     delete mongoose.models.Order;
// }
// Actually, standard pattern for Next.js to avoid "OverwriteModelError" is check existence.
// But to FORCE schema update, we might need to be aggressive or use a different name temporarily if stuck.
// Let's try deleting it explicitly if we suspect it's stale.
// Force recompilation if schema changed
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", OrderSchema);
