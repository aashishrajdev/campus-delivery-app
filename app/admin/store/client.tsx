"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  updateStoreDetailsAction,
  updateProductAction,
  createStoreProductAction,
  deleteStoreProductAction,
} from "./store-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Trash2, MapPin, Package } from "lucide-react";
import { hostels } from "@/lib/data";

export function StoreDashboardClient({
  data,
  type,
}: {
  data: any;
  type: string;
}) {
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search/Header area is handled by parent page or layout, focusing on dashboard content */}

      {/* Store Identity Section */}
      <section className="relative group rounded-xl overflow-hidden bg-white shadow-sm border">
        <div className="h-32 bg-gray-900/10">
          {/* Cover image placeholder or actual cover if we had one */}
        </div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start -mt-12">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white p-1 border shadow-sm">
                <img
                  src={data.image || "/placeholder.jpg"}
                  alt={data.name || data.names}
                  className="w-full h-full object-cover rounded-lg bg-gray-100"
                />
              </div>
            </div>

            <div className="flex-1 mt-12 sm:mt-14 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data.name || data.names}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {data.location || "No location set"}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditStoreOpen(true)}
                  className="shrink-0 gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Details
                </Button>
              </div>

              {type === "store" && (
                <p className="text-gray-600 max-w-2xl text-sm mt-3">
                  {data.description || "No description provided."}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <ProductsManager data={data} type={type} />

      {/* Edit Details Dialog */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store Details</DialogTitle>
          </DialogHeader>
          <DetailsForm
            data={data}
            type={type}
            onClose={() => setIsEditStoreOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailsForm({
  data,
  type,
  onClose,
}: {
  data: any;
  type: string;
  onClose: () => void;
}) {
  const [loading, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.append("id", data.id);
    fd.append("type", type);

    startTransition(async () => {
      const res = await updateStoreDetailsAction(fd);
      if (res.ok) {
        toast.success("Details updated");
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Failed to update");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={data.name || data.names}
          required
        />
      </div>

      <div>
        <Label htmlFor="type-select">Type</Label>
        <select
          id="type-select"
          name="storeType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          defaultValue={data.type || "non-veg"}
        >
          <option value="veg">Veg</option>
          <option value="non-veg">Non-Veg</option>
          <option value="both">Both</option>
        </select>
      </div>

      {type !== "store" && (
        <div>
          <Label htmlFor="hostel-select">Hostel</Label>
          <select
            id="hostel-select"
            name="hostel"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            defaultValue={data.hostel || ""}
          >
            <option value="">Select Hostel...</option>
            {hostels.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      )}
      {type === "store" && (
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={data.description}
            required
            className="resize-none"
            rows={3}
          />
        </div>
      )}
      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          defaultValue={data.location}
          required
        />
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input id="image" name="image" defaultValue={data.image} required />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ProductsManager({ data, type }: { data: any; type: string }) {
  const [items, setItems] = useState<any[]>(data.items || []);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setItems(data.items || []);
  }, [data.items]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsNew(false);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem({});
    setIsNew(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to remove this item?")) return;

    const fd = new FormData();
    fd.append("storeId", data.id);
    fd.append("type", type);
    fd.append("itemId", itemId);

    const res = await deleteStoreProductAction(fd);
    if (res.ok) {
      toast.success("Item removed");
      router.refresh();
    } else {
      toast.error("Failed to remove item");
    }
  };

  const handleSaveItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("storeId", data.id);
    fd.append("type", type);
    if (!isNew) {
      fd.append("itemId", editingItem._id);
    }

    if (isNew) {
      const res = await createStoreProductAction(fd);
      setSaving(false);
      setIsDialogOpen(false);
      if (res.ok) {
        toast.success("Product created");
        router.refresh();
      } else {
        toast.error(res.error || "Failed");
      }
      return;
    }

    // Optimistics
    const newName = String(fd.get("name"));
    const newDesc = String(fd.get("description"));
    const newImage = String(fd.get("image"));
    const newPrice = Number(fd.get("price"));

    let newStatus = "";
    if (type === "store") {
      newStatus = String(fd.get("availability"));
    } else {
      newStatus = String(fd.get("stock"));
    }

    const oldItems = [...items];
    setItems((prev) =>
      prev.map((item) => {
        if (item._id === editingItem._id) {
          return {
            ...item,
            price: newPrice,
            name: newName,
            description: newDesc,
            image: newImage,
            productId: item.productId
              ? {
                  ...item.productId,
                  name: newName,
                  Description: newDesc,
                  price: newPrice,
                  image: newImage,
                }
              : undefined,
            availability: type === "store" ? newStatus : item.availability,
            stock: type !== "store" ? newStatus : item.stock,
          };
        }
        return item;
      })
    );

    setIsDialogOpen(false);

    const res = await updateProductAction(fd);
    setSaving(false);

    if (res.ok) {
      toast.success("Item updated");
      router.refresh();
    } else {
      toast.error(res.error || "Failed");
      setItems(oldItems);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Products & Inventory</h3>
          <p className="text-sm text-gray-500">
            Manage your store's catalog and stock availability.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No products yet</h3>
          <p className="text-gray-500 mb-4">
            Start by adding your first product to the store.
          </p>
          <Button onClick={handleAdd} variant="outline">
            Add Product
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const name = item.productId?.name || item.name || "Unknown Product";
            const price = item.price ?? item.productId?.price ?? 0;
            const image =
              item.productId?.image || item.image || "/placeholder.jpg";
            const description =
              item.productId?.Description || item.description || "";
            const status = item.availability || item.stock;
            const isOutOfStock = status === "outOfStock" || status === "out";

            return (
              <Card
                key={item._id}
                className="p-4 shadow-sm relative group overflow-hidden"
              >
                {/* Delete button positioned top right of the card */}
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border relative">
                    <img
                      src={image}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1 rounded">
                          OUT
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-base truncate pr-2">
                        {name}
                      </h3>
                      {/* Placeholder for spacing, delete button is absolute */}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 h-[2.5em]">
                      {description || "No description available"}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-primary">
                          ₹{price}
                        </span>
                        <Badge
                          variant={isOutOfStock ? "destructive" : "secondary"}
                          className="capitalize text-[10px] h-5 px-1.5"
                        >
                          {status === "inStock"
                            ? "In Stock"
                            : status === "in-stock"
                            ? "In Stock"
                            : "Out of Stock"}
                        </Badge>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="h-8 w-16 text-xs"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isNew ? "Add New Product" : "Edit Product"}
            </DialogTitle>
          </DialogHeader>
          {(isNew || editingItem) && (
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  name="name"
                  defaultValue={
                    isNew ? "" : editingItem.productId?.name || editingItem.name
                  }
                  placeholder="Product Name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prod-type">Type</Label>
                  <select
                    id="prod-type"
                    name="productType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    defaultValue={
                      isNew
                        ? "veg"
                        : editingItem.productId?.type ||
                          editingItem.type ||
                          "veg"
                    }
                  >
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="product-desc">Description</Label>
                <Textarea
                  id="product-desc"
                  name="description"
                  placeholder="Product description"
                  defaultValue={
                    isNew
                      ? ""
                      : editingItem.productId?.Description ||
                        editingItem.description ||
                        ""
                  }
                />
              </div>

              <div>
                <Label htmlFor="product-img">Image URL</Label>
                <Input
                  id="product-img"
                  name="image"
                  placeholder="https://..."
                  defaultValue={
                    isNew
                      ? ""
                      : editingItem.productId?.image || editingItem.image || ""
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    defaultValue={
                      isNew
                        ? ""
                        : editingItem.price || editingItem.productId?.price
                    }
                    required
                  />
                </div>
                {type === "store" ? (
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <select
                      id="availability"
                      name="availability"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      defaultValue={editingItem?.availability || "inStock"}
                    >
                      <option value="inStock">In Stock</option>
                      <option value="outOfStock">Out of Stock</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="stock">Stock Status</Label>
                    <select
                      id="stock"
                      name="stock"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      defaultValue={editingItem?.stock || "in-stock"}
                    >
                      <option value="in-stock">In Stock</option>
                      <option value="low">Low Stock</option>
                      <option value="out">Out of Stock</option>
                    </select>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Product"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
