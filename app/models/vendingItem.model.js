import mongoose, {Schema} from 'mongoose';

const vendingItemSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type:Number,
        required: true
    },
    stock:{
        type: String,
        enum:["inStock","outOfStock"],
        default:"inStock",
        required: true
    },
},{timestamps: true})

export default mongoose.model("vendingItem", vendingItemSchema)