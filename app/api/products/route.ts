import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/db";
import Product from "@/app/models/product.model";

export async function GET(request: NextRequest) {
  try {
    const conn = await dbConnect();
    if (!conn) {
      console.warn("Database connection failed");
      return NextResponse.json([], { status: 200 });
    }
    const products = await Product.find({}).lean();
    console.log(`API: Found ${products.length} products`);
    // Serialize for JSON response
    const serialized = JSON.parse(JSON.stringify(products));
    return NextResponse.json(serialized);
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
