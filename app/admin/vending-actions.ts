"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/app/db";
import VendingMachine from "@/app/models/vendingMachine.model";

export async function restockVendingItemAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "Database not configured." };

    const machineId = String(formData.get("machineId") || "").trim();
    const productId = String(formData.get("productId") || "").trim();
    const quantity = Number(formData.get("quantity") || 0);

    if (!machineId || !productId || quantity < 0)
      return { ok: false, error: "Invalid input." };

    const machine = await VendingMachine.findById(machineId);
    if (!machine) return { ok: false, error: "Machine not found." };

    // Find if this product already exists in machine's inventory
    const existingItemIndex = machine.items.findIndex(
      (item: any) => item.productId && item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      machine.items[existingItemIndex].quantity = quantity;
    } else {
      // Add new product to machine inventory
      machine.items.push({
        productId: productId,
        quantity: quantity,
      });
    }

    await machine.save();
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/api/vending-machines");

    console.log(`Updated product stock in machine ${machine.names}`);
    return { ok: true };
  } catch (err) {
    console.error("restockVendingItemAction error:", err);
    return { ok: false, error: "Failed to update stock." };
  }
}
