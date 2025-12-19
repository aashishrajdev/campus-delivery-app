import { NextResponse } from "next/server";
import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";

export async function GET() {
    await dbConnect();
    try {
        const stores = await Store.find({
            $or: [{ phoneNumber: { $exists: false } }, { phoneNumber: "" }],
        });

        let updatedCount = 0;
        for (const store of stores) {
            store.phoneNumber = "+91 9999999999";
            await store.save();
            updatedCount++;
        }

        return NextResponse.json({
            success: true,
            updated: updatedCount,
            message: `Updated ${updatedCount} stores with dummy phone numbers.`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
