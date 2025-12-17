import mongoose, {Schema} from 'mongoose';

const productSchema = new Schema({
    name:{type: String, required:true},
    Description:{type: String, required: true},
    price:{type: Number, required:true},
    availability:{
        type: String,
        enum: ["inStock", "outOfStock"],
        default:"inStock",
        required: true
    },
    image:{type: String, required: true}
},{timestamps: true})


export default mongoose.model("Product",productSchema)