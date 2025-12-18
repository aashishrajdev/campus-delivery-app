import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema(
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
    date: {
      type: Date,
      required: true,
    },
    time: String,
    venue: String,
    registrationLink: String,
  },
  { timestamps: true }
);
// Avoid OverwriteModelError in dev/HMR by reusing compiled model
const EventModel =
  mongoose.models.Event || mongoose.model("Event", eventSchema);
export default EventModel;
