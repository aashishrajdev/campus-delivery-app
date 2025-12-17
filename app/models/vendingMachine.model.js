import mongoose, {Schema} from 'mongoose';
import {vendingItemSchema} from './vendingItem.model.js';

const vendingMachineSchema = new Schema({
    id:{
        type: String,
        required: true,
        unique: true
    },
    names:{
        type: String,
        required: true
    },
    hostel:{
        type: String,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    items:[vendingItemSchema]
},{timestamps: true})


export default mongoose.model("VendingMachine",vendingMachineSchema)
