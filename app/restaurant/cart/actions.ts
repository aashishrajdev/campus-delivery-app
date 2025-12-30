"use server";

import dbConnect from "@/app/db";
import VendingMachine from "@/app/models/vendingMachine.model.js";
import { revalidatePath } from "next/cache";

export async function createOrderAction(
  items: Record<string, number>,
  deliveryItems: any[]
) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "DB Error" };

    const itemIds = Object.keys(items);
    if (itemIds.length === 0) return { ok: false, error: "Cart is empty" };

    // Iterate over each item in the cart
    for (const itemId of itemIds) {
      const quantityToBuy = items[itemId];

      // Try to find in Vending Machines first (since this is the requested feature)
      // We need to find which machine has this item.
      // Since itemId is likely the subdocument _id or equal to it.

      const machine = await VendingMachine.findOne({
        "items._id": itemId,
      });

      if (machine) {
        // Found in a machine
        const item = machine.items.id(itemId);
        if (item.quantity < quantityToBuy) {
          return {
            ok: false,
            error: `Insufficient stock for ${item.name || "item"}`,
          };
        }

        // Decrement
        item.quantity -= quantityToBuy;
        await machine.save();
      } else {
        // Maybe it's a store item or static item (if static, we skip stock check for now or handle differently)
        // For this task, we focus on Vending Machine stock decrement.
      }
    }

    revalidatePath("/restaurant");
    revalidatePath("/admin/vending-machines"); // Update admin view
    return { ok: true };
  } catch (err) {
    console.error("createOrderAction error:", err);
    return { ok: false, error: "Failed to create order" };
  }
}
