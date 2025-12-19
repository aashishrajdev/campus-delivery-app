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

export async function createStoreProductAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "DB Error" };

    const type = formData.get("type");
    const storeId = formData.get("storeId"); // string 'id'
    const name = String(formData.get("name"));
    const price = Number(formData.get("price"));
    const description = String(formData.get("description") || "");
    const image = String(formData.get("image") || "");

    // 1. Create Global Product
    // Dynamically import Product to avoid circular dep issues
    const Product = (await import("@/app/models/product.model")).default;

    // We need the actual _id of the store/vm to satisfy the Product schema 'store' field requirement
    let storeObj;
    if (type === "store") {
      storeObj = await Store.findOne({ id: storeId });
    } else {
      storeObj = await VendingMachine.findOne({ id: storeId });
    }

    if (!storeObj) {
      return { ok: false, error: "Store not found" };
    }

    // Check if product with same name exists?
    // Ideally we might want to reuse, but for this simple app, let's create new or simple check.
    // Let's create a new one to allow custom descriptions/images per store conceptually,
    // even though Product is shared.

    const newProduct = await Product.create({
      name,
      Description: description,
      price: price,
      image,
      availability: "inStock", // Default
      store: storeObj._id, // Assign the ObjectId of the store
    });

    const newItem = {
      productId: newProduct._id,
      price: price, // Store specific price
    };

    if (type === "store") {
      const availability = String(formData.get("availability") || "inStock");
      // @ts-ignore
      newItem.availability = availability;
      // @ts-ignore
      newItem.name = name; // redundancy for quick access if needed, but productId is main

      await Store.findOneAndUpdate(
        { id: storeId },
        { $push: { items: newItem } }
      );
    } else {
      const stock = String(formData.get("stock") || "in-stock");
      // @ts-ignore
      newItem.stock = stock;
      // @ts-ignore
      newItem.name = name; // Vending items explicitly use name

      await VendingMachine.findOneAndUpdate(
        { id: storeId },
        { $push: { items: newItem } }
      );
    }

    revalidatePath("/admin/store");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("create product error", err);
    return { ok: false, error: "Failed to create product" };
  }
}

export async function deleteStoreProductAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "DB Error" };

    const type = formData.get("type");
    const storeId = formData.get("storeId");
    const itemId = formData.get("itemId");

    if (type === "store") {
      await Store.findOneAndUpdate(
        { id: storeId },
        { $pull: { items: { _id: itemId } } }
      );
    } else {
      await VendingMachine.findOneAndUpdate(
        { id: storeId },
        { $pull: { items: { _id: itemId } } }
      );
    }

    revalidatePath("/admin/store");
    revalidatePath("/api/stores");
    return { ok: true };
  } catch (err) {
    console.error("delete product error", err);
    return { ok: false, error: "Failed to delete product" };
  }
}
