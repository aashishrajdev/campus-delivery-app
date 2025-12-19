"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function StoreDashboardClient({
  data,
  type,
}: {
  data: any;
  type: string;
}) {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="details">Store Details</TabsTrigger>
        <TabsTrigger value="products">Products & Inventory</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <DetailsForm data={data} type={type} />
      </TabsContent>

      <TabsContent value="products">
        <ProductsManager data={data} type={type} />
      </TabsContent>
    </Tabs>
  );
}

function DetailsForm({ data, type }: { data: any; type: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    fd.append("id", data.id); // original ID identifier
    fd.append("type", type);

    // For Vending Machine, map 'name' back to 'names'
    // The server action will handle the field mapping based on type

    const res = await updateStoreDetailsAction(fd);
    setLoading(false);
    if (res.ok) {
      toast.success("Details updated");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to update");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={data.name || data.names}
              required
            />
          </div>
          {type === "store" && (
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={data.description}
                required
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
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ProductsManager({ data, type }: { data: any; type: string }) {
  const [items, setItems] = useState<any[]>(data.items || []);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [isNew, setIsNew] = useState(false); // Track if adding new

  // In this simplified version, we are editing existing items embedded in the store/vm.
  // Adding new items would require selecting from global Products (future improvement).

  /* Synchronize local state with server data on refresh */
  useEffect(() => {
    setItems(data.items || []);
  }, [data.items]);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
    setIsNew(false);
  };

  const handleAdd = () => {
    setEditingItem({});
    setIsDialogOpen(true);
    setIsNew(true);
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

    // Extract values for optimistic update
    const newName = String(fd.get("name"));
    const newPrice = Number(fd.get("price"));
    let newStatus = "";

    if (type === "store") {
      newStatus = String(fd.get("availability"));
    } else {
      newStatus = String(fd.get("stock"));
    }

    // Optimistic Update
    const oldItems = [...items];
    setItems((prev) =>
      prev.map((item) => {
        if (item._id === editingItem._id) {
          return {
            ...item,
            price: newPrice,
            // Handle complex object vs flat field for name
            name: newName,
            // Optimistically update productId.name if it exists too, for display consistency
            productId: item.productId
              ? { ...item.productId, name: newName, price: newPrice }
              : undefined,
            availability: type === "store" ? newStatus : item.availability,
            stock: type !== "store" ? newStatus : item.stock,
          };
        }
        return item;
      })
    );

    setIsDialogOpen(false); // Close immediately for snappiness

    const res = await updateProductAction(fd);
    setSaving(false);

    if (res.ok) {
      toast.success("Item updated");
      router.refresh();
    } else {
      toast.error(res.error || "Failed");
      setItems(oldItems); // Revert on failure
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Inventory</CardTitle>
        <Button onClick={handleAdd} size="sm">
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock/Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item._id}>
                {/* <TableCell>
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    {item.emoji || "📦"}
                  </div>
                </TableCell> */}
                <TableCell className="font-medium">
                  {/* Access name from populated productId if available or direct name */}
                  {item.productId?.name || item.name}
                </TableCell>
                <TableCell>₹{item.price || item.productId?.price}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.availability === "inStock" ||
                      item.stock === "in-stock"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {item.availability || item.stock}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="ml-2"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isNew ? "Add New Product" : "Edit Item"}
              </DialogTitle>
            </DialogHeader>
            {editingItem && (
              <form onSubmit={handleSaveItem} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    name="name"
                    defaultValue={
                      isNew
                        ? ""
                        : editingItem.productId?.name || editingItem.name
                    }
                    required
                  />
                </div>
                {isNew && (
                  <>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        placeholder="Product description"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="image">Image URL</Label>
                      <Input
                        id="image"
                        name="image"
                        placeholder="/images/example.jpg"
                        required
                      />
                    </div>
                  </>
                )}
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={editingItem.availability}
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
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        defaultValue={editingItem.stock}
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
                    Save
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
