"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";
import bcrypt from "bcryptjs";

export async function createStoreAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "Database not configured." };
    const id = String(formData.get("id") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const type = String(formData.get("type") || "non-veg"); // Default to non-veg matches UI
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!id || !name || !description || !username || !password)
      return { ok: false, error: "All fields are required." };

    // Check uniqueness
    const existing = await Store.findOne({
      $or: [{ id }, { username }],
    });
    if (existing)
      return { ok: false, error: "Store ID or Username already exists." };

    const hashedPassword = await bcrypt.hash(password, 10);

    await Store.create({
      id,
      name,
      description,
      type, // Pass type
      username,
      password: hashedPassword,
      items: [],
      image: "/placeholder-logo.png", // Default image
      location: "Active Campus", // Default location
    });

    revalidatePath("/admin/stores");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("createStoreAction error:", err);
    return { ok: false, error: "Failed to create store." };
  }
}

export async function updateStoreAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "Database not configured." };
    const originalId = String(formData.get("originalId") || "");
    const id = String(formData.get("id") || "").trim();
    const name = String(formData.get("name") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const type = String(formData.get("type") || "non-veg");
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!originalId) return { ok: false, error: "Missing original store id." };

    const updateData: any = { id, name, description, type, username };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await Store.findOneAndUpdate(
      { id: originalId }, // usage of custom ID
      updateData,
      { new: true }
    );

    revalidatePath("/admin/stores");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("updateStoreAction error:", err);
    return { ok: false, error: "Failed to update store." };
  }
}

export async function deleteStoreAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "Database not configured." };
    const id = String(formData.get("id") || "");
    if (!id) return { ok: false, error: "Missing store id." };
    await Store.findOneAndDelete({ id }); // usage of custom ID
    revalidatePath("/admin/stores");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("deleteStoreAction error:", err);
    return { ok: false, error: "Failed to delete store." };
  }
}
