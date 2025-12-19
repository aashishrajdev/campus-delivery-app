import mongoose, { Schema } from "mongoose";
import { storeItemSchema } from "./storeItem.model.js";

const storeSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: false,
      default: "",
    },
    image: {
      type: String,
      required: false,
      default: "",
    },
    type: {
      type: String,
      enum: ["veg", "non-veg"],
      default: "veg",
    },
    items: { type: [storeItemSchema], default: [] },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    items: [storeItemSchema],
  },
  { timestamps: true }
);

export default mongoose.models.Store || mongoose.model("Store", storeSchema);
