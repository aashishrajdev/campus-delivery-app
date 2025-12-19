"use server";

import dbConnect from "@/app/db";
import Order from "@/app/models/order.model";
import User from "@/app/models/user.model";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Types } from "mongoose";

// Initialize Razorpay
// Note: In production, these should be in process.env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
});

export async function createOrder({
    userId,
    items,
    totalAmount,
    paymentMethod,
    address,
}) {
    await dbConnect();

    try {
        const newOrder = new Order({
            userId,
            items,
            totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === "ONLINE" ? "PENDING" : "PENDING", // Update to COMPLETED immediately if COD? Usually COD is PENDING until delivery.
            status: "PENDING",
            address: address
            // Add other fields if needed from address
        });

        let razorpayOrderData = null;

        if (paymentMethod === "ONLINE") {
            const options = {
                amount: Math.round(totalAmount * 100), // amount in lowest currency unit (paise)
                currency: "INR",
                receipt: `receipt_${new Date().getTime()}`,
            };
            const order = await razorpay.orders.create(options);
            newOrder.razorpayOrderId = order.id;
            razorpayOrderData = order;
        }

        const savedOrder = await newOrder.save();

        // Add to user history
        await User.findByIdAndUpdate(userId, {
            $push: { orderHistory: savedOrder._id },
        });

        return {
            success: true,
            orderId: savedOrder._id.toString(),
            razorpayOrder: razorpayOrderData,
        };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
    }
}

export async function verifyPayment({
    orderId,
    razorpayPaymentId,
    razorpaySignature,
}) {
    await dbConnect();

    try {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        const generated_signature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET || "secret_placeholder"
            )
            .update(order.razorpayOrderId + "|" + razorpayPaymentId)
            .digest("hex");

        if (generated_signature === razorpaySignature) {
            order.paymentStatus = "COMPLETED";
            order.razorpayPaymentId = razorpayPaymentId;
            order.status = "CONFIRMED"; // Auto confirm on payment?
            await order.save();
            return { success: true };
        } else {
            return { success: false, error: "Invalid signature" };
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return { success: false, error: error.message };
    }
}

export async function getUserOrders(userId) {
    await dbConnect();
    try {
        // Query the Order collection directly instead of relying on user.orderHistory array.
        // This is more robust and finds "orphaned" orders.
        const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        const ordersJson = JSON.parse(JSON.stringify(orders));

        // Enrich orders with source details (Name, Phone)
        // We can do this efficiently by gathering all unique source IDs first
        // But for simplicity and acceptable performance with reasonable order history size,
        // we can just lookup as we map or do a Promise.all
        // Let's try to be smart about it.

        const sourceIds = new Set();
        ordersJson.forEach(order => {
            if (order.items && order.items.length > 0) {
                // Usually an order is from ONE source, but our schema allows multiple?
                // Schema has items array, each item has sourceId.
                // In practice, a cart is usually per-store.
                // let's grab unique sourceIds from all items in all orders.
                order.items.forEach(item => {
                    if (item.sourceId) sourceIds.add(item.sourceId);
                });
            }
        });

        const storeMap = {}; // id -> { name, phone }
        const vendingMap = {}; // id -> { name, phone }

        // Fetch details for all identified sources
        // We have to check both Stores and VendingMachines because sourceIds are mixed?
        // Actually items have sourceModel: 'Store' or 'VendingMachine'.
        // Let's split IDs by type.

        const storeIds = new Set();
        const vendingIds = new Set();

        ordersJson.forEach(order => {
            if (order.items) {
                order.items.forEach(item => {
                    if (item.sourceModel === 'Store') storeIds.add(item.sourceId);
                    else if (item.sourceModel === 'VendingMachine') vendingIds.add(item.sourceId);
                });
            }
        });

        // Loop stores
        for (const sid of Array.from(storeIds)) {
            try {
                // Try finding by custom ID first (as String)
                let store: any = await Store.findOne({ id: sid }).select('name phoneNumber');
                if (!store && Types.ObjectId.isValid(sid as string)) {
                    store = await Store.findById(sid).select('name phoneNumber');
                }
                if (store) {
                    storeMap[sid as string] = { name: store.name, phone: store.phoneNumber };
                }
            } catch (e) { console.error(`Failed to fetch store ${sid}`, e); }
        }

        // Loop vending machines
        for (const vid of Array.from(vendingIds)) {
            try {
                let vm: any = null;
                if (Types.ObjectId.isValid(vid as string)) {
                    vm = await VendingMachine.findById(vid).select('name names');
                }
                if (!vm) { // Try finding by other custom ID if exists? VendingMachine model usually just uses _id unless specified.
                    // Let's assume _id for now based on typical usage
                }

                if (vm) {
                    const vName = vm.names || vm.name || "Vending Machine";
                    // Vending machines usually don't have phone numbers for users to call, maybe admin contact?
                    // We'll leave phone blank for now.
                    vendingMap[vid as string] = { name: vName, phone: null };
                }
            } catch (e) { console.error(`Failed to fetch VM ${vid}`, e); }
        }

        // Attach to orders
        const enrichedOrders = ordersJson.map(order => {
            const enrichedItems = order.items.map(item => {
                let details = { name: 'Unknown', phone: null };
                if (item.sourceModel === 'Store') details = storeMap[item.sourceId] || details;
                else if (item.sourceModel === 'VendingMachine') details = vendingMap[item.sourceId] || details;

                return {
                    ...item,
                    sourceName: details.name || item.name, // Fallback to item name if source unknown? No, maybe just "Unknown Store"
                    sourcePhone: details.phone
                };
            });
            return { ...order, items: enrichedItems };
        });

        return enrichedOrders;
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
}

import Store from "@/app/models/store.model";
import VendingMachine from "@/app/models/vendingMachine.model";

export async function getAdminStats() {
    await dbConnect();
    try {
        const rawStats = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: { source: "$items.source", sourceId: "$items.sourceId" },
                    totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    settledAmount: {
                        $sum: { $cond: [{ $eq: ["$items.isSettled", true] }, { $multiply: ["$items.price", "$items.quantity"] }, 0] }
                    },
                    unsettledAmount: {
                        $sum: { $cond: [{ $eq: ["$items.isSettled", false] }, { $multiply: ["$items.price", "$items.quantity"] }, 0] }
                    }
                }
            }
        ]);

        const storeStats = [];
        const vendingStats = [];

        for (const stat of rawStats) {
            const { source, sourceId } = stat._id;
            let name = "Unknown";
            try {
                if (source === "STORE") {
                    let store = null;
                    if (Types.ObjectId.isValid(sourceId)) {
                        store = await Store.findById(sourceId);
                    }
                    if (!store) {
                        store = await Store.findOne({ id: sourceId });
                    }

                    if (store) name = store.name;
                    storeStats.push({
                        _id: sourceId.toString(),
                        name,
                        totalRevenue: stat.totalRevenue,
                        settledAmount: stat.settledAmount,
                        unsettledAmount: stat.unsettledAmount
                    });
                } else if (source === "VENDING") {
                    let vm = null;
                    if (Types.ObjectId.isValid(sourceId)) {
                        vm = await VendingMachine.findById(sourceId);
                    }
                    // Assuming VendingMachine might also have custom ID logic or simple string id
                    // If not, we just rely on findById. But let's be safe.
                    // If VendingMachine model has 'id' field, we could check that too.

                    if (vm) name = vm.names || vm.name || "Vending Machine";
                    vendingStats.push({
                        _id: sourceId.toString(),
                        name,
                        totalRevenue: stat.totalRevenue,
                        settledAmount: stat.settledAmount,
                        unsettledAmount: stat.unsettledAmount
                    });
                }
            } catch (err) {
                console.error(`Error fetching details for ${source} ${sourceId}`, err);
            }
        }

        return {
            storeStats: JSON.parse(JSON.stringify(storeStats)),
            vendingStats: JSON.parse(JSON.stringify(vendingStats))
        };
    } catch (error) {
        console.error("Error getting admin stats:", error);
        return { storeStats: [], vendingStats: [] };
    }
}

export async function settleOrders(sourceId) {
    await dbConnect();
    try {
        // Mark all items from this source as settled
        // This is complex because we need to update 'items' inside 'Order'.
        // We can use array filters.

        await Order.updateMany(
            { "items.sourceId": sourceId, "items.isSettled": false },
            { $set: { "items.$[elem].isSettled": true } },
            { arrayFilters: [{ "elem.sourceId": sourceId, "elem.isSettled": false }] }
        );

        return { success: true };
    } catch (error) {
        console.error("Error settling orders:", error);
        return { success: false, error: error.message };
    }
}

export async function getStoreOrders(storeId: string) {
    await dbConnect();
    try {
        // Find orders that have at least one item from this store
        // We need to filter items in the result to only show items from this store?
        // User wants to see the order. Usually showing the full order is okay, 
        // OR showing only relevant items. 
        // For simplicity and correctness for the Store Owner, they should probably only see THEIR items.
        // But the Order object structure has 'items' array.
        // I'll return the full order but maybe the UI should highlight their items.
        // The query finds orders where "items.sourceId" matches.
        // NOTE: storeId might be the custom 'id' string (e.g. "2") or an ObjectId string.
        // Our Store model uses custom 'id' for sourceId in items (usually).

        const orders = await Order.find({ "items.sourceId": storeId }).sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(orders));
    } catch (error) {
        console.error("Error fetching store orders:", error);
        return [];
    }
}
