"use server";

import dbConnect from "@/app/db";
import User from "@/app/models/user.model";

export async function getUserAddress(userId: string) {
    if (!userId) return null;
    await dbConnect();
    try {
        const user = await User.findById(userId).select("address");
        return user?.address || "";
    } catch (e) {
        console.error("Error fetching user address", e);
        return "";
    }
}
