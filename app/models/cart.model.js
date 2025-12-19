import mongoose, { Schema, Types } from 'mongoose';

const CartItemSchema = new Schema(
    {
        productId: {
            type: Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        purchasePrice: { // price of one unit at time of adding to cart
            type: Number,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
        source: {
            type: String,
            enum: ['STORE', 'VENDING'],
            required: true,
            default: 'STORE'
        },
        sourceId: {
            type: Types.ObjectId,
            required: true,
            refPath: 'items.sourceModel'
        },
        sourceModel: {
            type: String,
            required: true,
            enum: ['Store', 'VendingMachine'],
            default: 'Store'
        },
        image: {
            type: String,
            required: false,
        },
    },
    { _id: false }
);

const CartSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        items: [CartItemSchema],
    },
    { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);