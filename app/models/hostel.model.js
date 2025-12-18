import mongoose, { Schema } from "mongoose";

const hostelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Hostel || mongoose.model("Hostel", hostelSchema);
