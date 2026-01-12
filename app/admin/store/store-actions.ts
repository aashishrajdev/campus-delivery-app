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

    const name = String(formData.get("name") || "");
    const location = String(formData.get("location") || "");
    const image = String(formData.get("image") || "");
    const storeType = String(formData.get("storeType") || "both");

    if (type === "store") {
      const description = String(formData.get("description") || "");
      await Store.findOneAndUpdate(
        { id },
        { name, description, location, image, type: storeType }
      );
    } else {
      const hostel = String(formData.get("hostel") || "");
      await VendingMachine.findOneAndUpdate(
        { id },
        { names: name, location, image, type: storeType, hostel }
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
    const name = String(formData.get("name"));
    const description = String(formData.get("description"));
    const image = String(formData.get("image"));

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

      const store = await Store.findOne({ id: storeId });
      const item = store?.items.id(itemId);
      if (item && item.productId) {
        const productType = String(formData.get("productType") || "veg");

        const Product = (await import("@/app/models/product.model")).default;
        await Product.findByIdAndUpdate(item.productId, {
          name,
          Description: description,
          image,
          type: productType,
        });
      }
    } else {
      const quantity = Number(formData.get("quantity"));

      await VendingMachine.updateOne(
        { id: storeId, "items._id": itemId },
        {
          $set: {
            "items.$.price": price,
            "items.$.quantity": quantity,
            "items.$.name": name,
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
    const storeId = formData.get("storeId");
    const name = String(formData.get("name"));
    const price = Number(formData.get("price"));
    const description = String(formData.get("description") || "");
    const image = String(formData.get("image") || "");
    const productType = String(formData.get("productType") || "veg");

    // Dynamically import Product to avoid circular dep issues
    const Product = (await import("@/app/models/product.model")).default;

    let storeObj;
    if (type === "store") {
      storeObj = await Store.findOne({ id: storeId });
    } else {
      storeObj = await VendingMachine.findOne({ id: storeId });
    }

    if (!storeObj) {
      return { ok: false, error: "Store not found" };
    }

    const newProduct = await Product.create({
      name,
      Description: description,
      price: price,
      image,
      type: productType,
      availability: "inStock",
      store: storeObj._id,
    });

    const newItem = {
      productId: newProduct._id,
      price: price,
    };

    if (type === "store") {
      const availability = String(formData.get("availability") || "inStock");
      // @ts-ignore
      newItem.availability = availability;
      // @ts-ignore
      newItem.name = name;

      await Store.findOneAndUpdate(
        { id: storeId },
        { $push: { items: newItem } }
      );
    } else {
      const quantity = Number(formData.get("quantity") || 0);
      // @ts-ignore
      newItem.quantity = quantity;
      // @ts-ignore
      newItem.name = name;

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

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "DB Error" };

    const Order = (await import("@/app/models/order.model")).default;

    await Order.findByIdAndUpdate(orderId, { status });

    revalidatePath("/admin/store");
    return { ok: true };
  } catch (err) {
    console.error("update order status error", err);
    return { ok: false, error: "Failed to update status" };
  }
}