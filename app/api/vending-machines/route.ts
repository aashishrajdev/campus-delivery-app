import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/db";
import VendingMachine from "@/app/models/vendingMachine.model";

export async function GET(request: NextRequest) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      console.warn("Database connection failed");
      return NextResponse.json([], { status: 200 });
    }
    const machines = await VendingMachine.find({})
      .populate({
        path: "items",
        populate: {
          path: "productId",
        },
      })
      .lean();
    console.log(`API: Found ${machines.length} vending machines`);
    const serialized = JSON.parse(JSON.stringify(machines));
    return NextResponse.json(serialized);
  } catch (err) {
    console.error("GET /api/vending-machines error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
