import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/app/db";
import User from "@/app/models/user.model";
import { verifyToken } from "@/app/utils/jwt";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization" },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token) as any;
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  const conn = await dbConnect();
  if (!conn) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 500 }
    );
  }
  const user = await User.findById(payload.id).select(
    "email phone name address roomNumber profileImage"
  );
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    email: user.email,
    phone: user.phone,
    name: user.name,
    address: user.address,
    roomNumber: user.roomNumber,
    profileImage: user.profileImage,
  });
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization" },
      { status: 401 }
    );
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token) as any;
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Whitelist allowed fields to prevent arbitrary updates
    const allowedFields = [
      "name",
      "phone",
      "address",
      "roomNumber",
      "profileImage",
    ];
    const updateData: Record<string, any> = {};

    // Only include fields that are actually present in the request body
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    const conn = await dbConnect();
    if (!conn) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(payload.id, updateData, {
      new: true,
      runValidators: true,
    }).select("email phone name address roomNumber profileImage");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      email: updatedUser.email,
      phone: updatedUser.phone,
      name: updatedUser.name,
      address: updatedUser.address,
      roomNumber: updatedUser.roomNumber,
      profileImage: updatedUser.profileImage,
    });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
