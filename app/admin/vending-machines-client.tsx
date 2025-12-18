"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { restockVendingItemAction } from "./vending-actions";

interface VendingMachinesClientProps {
  machines: any[];
  products: any[];
}

export function VendingMachinesClient({
  machines,
  products,
}: VendingMachinesClientProps) {
  const [open, setOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pending, setPending] = useState(false);

  const currentMachine = machines.find((m) => m._id === selectedMachine);
  const currentProduct = products.find((p) => p._id === selectedProduct);

  // Filter products to only show those available in the current machine
  const availableProducts = currentMachine
    ? products.filter((product) =>
        currentMachine.items.some(
          (item: any) =>
            item.productId && item.productId.toString() === product._id
        )
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine || !selectedProduct || !quantity) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setPending(true);
      const fd = new FormData();
      fd.append("machineId", selectedMachine);
      fd.append("productId", selectedProduct);
      fd.append("quantity", quantity);

      const res = await restockVendingItemAction(fd);
      if (res.ok) {
        toast.success("Stock updated successfully");
        setOpen(false);
        setSelectedMachine("");
        setSelectedProduct("");
        setQuantity("");
      } else {
        toast.error(res.error || "Failed to update");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        Update Vending Stock
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Vending Machine Stock</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="machine">Select Machine</Label>
              <select
                id="machine"
                value={selectedMachine}
                onChange={(e) => {
                  setSelectedMachine(e.target.value);
                  setSelectedProduct("");
                }}
                className="h-9 rounded-md border px-3 w-full"
              >
                <option value="">Choose a machine...</option>
                {machines.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.names} ({m.location}, {m.hostel})
                  </option>
                ))}
              </select>
            </div>

            {currentMachine && (
              <div>
                <Label htmlFor="product">Select Product</Label>
                <select
                  id="product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="h-9 rounded-md border px-3 w-full"
                >
                  <option value="">Choose a product...</option>
                  {availableProducts.map((product: any) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ₹{product.price}
                    </option>
                  ))}
                </select>
                {availableProducts.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    No products added to this machine yet. Add products via
                    "Manage Products".
                  </p>
                )}
              </div>
            )}

            {currentProduct && (
              <div className="p-3 bg-secondary rounded-lg text-sm">
                <p>
                  <strong>Product:</strong> {currentProduct.name}
                </p>
                <p className="text-muted-foreground mt-1">
                  Enter stock quantity for this machine
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="quantity">Stock Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 10"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Updating..." : "Update Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
