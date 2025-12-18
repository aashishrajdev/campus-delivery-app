"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";
import VendingMachine from "@/app/models/vendingMachine.model";

export async function updateStoreDetailsAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "DB Error" };

    const type = formData.get("type");
    const id = formData.get("id");

    // Common fields
    const name = String(formData.get("name") || "");
    const location = String(formData.get("location") || "");
    const image = String(formData.get("image") || "");

    if (type === "store") {
      const description = String(formData.get("description") || "");
      await Store.findOneAndUpdate(
        { id },
        { name, description, location, image }
      );
    } else {
      // Vending Machine
      await VendingMachine.findOneAndUpdate(
        { id },
        { names: name, location, image }
      );
    }

    revalidatePath("/admin/store");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("update details error", err);
    return { ok: false, error: "Failed to update" };
  }
}

export async function updateProductAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "DB Error" };

    const type = formData.get("type");
    const storeId = formData.get("storeId");
    const itemId = formData.get("itemId");
    const price = Number(formData.get("price"));

    if (type === "store") {
      const availability = String(formData.get("availability"));

      await Store.updateOne(
        { id: storeId, "items._id": itemId },
        {
          $set: {
            "items.$.price": price,
            "items.$.availability": availability,
          },
        }
      );
    } else {
      const stock = String(formData.get("stock"));

      await VendingMachine.updateOne(
        { id: storeId, "items._id": itemId },
        {
          $set: {
            "items.$.price": price,
            "items.$.stock": stock,
          },
        }
      );
    }

    revalidatePath("/admin/store");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("update product error", err);
    return { ok: false, error: "Failed to update item" };
  }
}
