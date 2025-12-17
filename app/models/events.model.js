import mongoose, {Schema} from 'mongoose';  

const eventSchema = new Schema({
    id:{
        type: String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true,
    },
    date:{
        type: Date,
        required: true
    },
    time: String,
    venue: String,
    registrationLink: String,
},{timestamps: true})

export default mongoose.model("Event",eventSchema);