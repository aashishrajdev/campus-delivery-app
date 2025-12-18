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
    const storeId = formData.get("storeId"); // this is the 'id' string, not _id
    const itemId = formData.get("itemId");
    const price = Number(formData.get("price"));
    const name = String(formData.get("name"));

    if (type === "store") {
      const availability = String(formData.get("availability"));
      // 1. Update the Store Item (price, availability)
      await Store.updateOne(
        { id: storeId, "items._id": itemId },
        {
          $set: {
            "items.$.price": price,
            "items.$.availability": availability,
          },
        }
      );

      // 2. Update the Product Name (Global Product)
      // First find the store to get the productId from the item
      const store = await Store.findOne({ id: storeId }, { items: 1 });
      const item = store.items.id(itemId);
      if (item && item.productId) {
        // Dynamically import Product to avoid circular dep issues if any, 
        // though top level import is usually fine.
        // We need to update the actual Product document
        const Product = (await import("@/app/models/product.model")).default;
        await Product.findByIdAndUpdate(item.productId, { name });
      }

    } else {
      const stock = String(formData.get("stock"));

      await VendingMachine.updateOne(
        { id: storeId, "items._id": itemId },
        {
          $set: {
            "items.$.price": price,
            "items.$.stock": stock,
            "items.$.name": name, // Vending items have their own name field
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
