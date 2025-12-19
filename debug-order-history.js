const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const userSchema = new mongoose.Schema({
    email: String,
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    items: Array,
    totalAmount: Number,
    status: String,
    createdAt: Date
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function checkOrders() {
    if (!process.env.MONGO_URI) {
        console.error("MONGO_URI not found");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const user = await User.findOne({ email: 'test1@gmail.com' }).populate('orderHistory');

        if (!user) {
            console.log("User not found: test1@gmail.com");
        } else {
            console.log("User found:", user.email, "ID:", user._id.toString());
            console.log("Order History Length:", user.orderHistory.length);
            console.log("Order History IDs:", user.orderHistory.map(o => o._id.toString()));

            // Find orders in Order collection
            const actualOrders = await Order.find({ userId: user._id });
            console.log("Actual Orders in DB for this User:", actualOrders.length);
            actualOrders.forEach(o => {
                console.log(`Order ${o._id}: Status=${o.status}, Amount=${o.totalAmount}, Date=${o.createdAt}`);
            })
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkOrders();
