const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Schemas minimalistically matching the actual DB structure
const userSchema = new mongoose.Schema({
    email: String,
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    items: Array,
    totalAmount: Number,
    status: String,
}, { strict: false, timestamps: true });
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

async function runDiagnostics() {
    if (!process.env.MONGO_URI) {
        console.error("❌ MONGO_URI is missing in .env.local");
        return;
    }

    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected.");

        const targetEmail = "test1@gmail.com";
        const user = await User.findOne({ email: targetEmail });

        if (!user) {
            console.log(`❌ User with email ${targetEmail} NOT FOUND.`);
            // Dump all users
            const allUsers = await User.find({}, 'email name');
            console.log("Available Users:", allUsers.map(u => `${u.name} (${u.email})`));
            return;
        }

        console.log(`✅ User Found: ${user.email} (ID: ${user._id})`);
        console.log(`📋 orderHistory Array Length: ${user.orderHistory ? user.orderHistory.length : 0}`);
        console.log(`📋 orderHistory IDs:`, user.orderHistory);

        // 1. Check if these IDs actually exist in Order collection
        if (user.orderHistory && user.orderHistory.length > 0) {
            const ordersFromHistory = await Order.find({ _id: { $in: user.orderHistory } });
            console.log(`🔍 Found ${ordersFromHistory.length} orders from history IDs.`);
        }

        // 2. Check for ORPHANED orders (Orders with this userId but not in history)
        const allUserOrders = await Order.find({ userId: user._id });
        console.log(`🔍 Total Orders found in 'orders' collection with userId=${user._id}: ${allUserOrders.length}`);

        if (allUserOrders.length === 0) {
            console.log("❌ NO ORDERS FOUND IN DB for this user.");
        } else {
            console.log("Example Orders:");
            allUserOrders.forEach(o => {
                console.log(` - OrderID: ${o._id} | Status: ${o.status} | Amount: ${o.totalAmount} | Time: ${o.createdAt}`);
            });
        }

    } catch (e) {
        console.error("❌ Diagnostic Error:", e);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
        process.exit(0); // Force exit
    }
}

runDiagnostics();
