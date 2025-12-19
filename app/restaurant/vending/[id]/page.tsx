"use client";

import { use, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function VendingMachineDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  // Re-define locations to find name
  const vendingLocations = [
    {
      id: "machine_1",
      name: "Main Lobby Vender",
      hostel: "Block A",
      location: "Ground Floor",
    },
    {
      id: "machine_2",
      name: "Canteen Vender",
      hostel: "Block B",
      location: "Canteen Area",
    },
    {
      id: "machine_3",
      name: "Library Vender",
      hostel: "Central",
      location: "Library Entrance",
    },
  ];

  const selectedLocation = vendingLocations.find((m) => m.id === id);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getAvailabilityStatus = (availability: string) => {
    if (availability === "outOfStock")
      return { status: "outOfStock", label: "✗ Out of Stock" };
    return { status: "inStock", label: "✓ Available" };
  };

  const handleOrderProduct = async (productId: string) => {
    try {
      setOrdering(true);
      // Simulate API call for vending dispense
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Order placed! Product dispensed.");
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  if (!selectedLocation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p>Machine not found</p>
        <Button onClick={() => router.push("/restaurant/vending")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-4">
      <div className="px-4 pt-4">
        <div className="animate-in fade-in-50 slide-in-from-right-4">
          <button
            onClick={() => router.push("/restaurant/vending")}
            className="text-primary mb-4 flex items-center gap-2 hover:gap-3 transition-all font-medium active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to machines
          </button>

          <Card className="p-4 mb-4 bg-gradient-to-br from-primary/10 to-accent/10 border-accent/30">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-accent/40 to-primary/40 rounded-xl flex items-center justify-center text-3xl">
                🏪
              </div>
              <div>
                <h2 className="text-lg font-bold">{selectedLocation?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  📍 {selectedLocation?.location}, {selectedLocation?.hostel}
                </p>
              </div>
            </div>
          </Card>

          <h3 className="text-base font-bold mb-3">Available Products</h3>
          <div className="space-y-3">
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products available
              </p>
            ) : (
              products.map((product: any, index: number) => {
                const { status, label } = getAvailabilityStatus(
                  product.availability
                );
                return (
                  <Card
                    key={product._id}
                    className="p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center text-4xl shadow-sm overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>🛍️</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {product.Description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-lg text-primary">
                            ₹{product.price}
                          </span>
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm transition-all ${
                              status === "inStock"
                                ? "bg-success/20 text-success border border-success/30"
                                : "bg-destructive/20 text-destructive border border-destructive/30"
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      </div>
                    </div>
                    {status === "inStock" && (
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-accent hover:bg-accent/90"
                        onClick={() => handleOrderProduct(product._id)}
                        disabled={ordering}
                      >
                        {ordering ? "Processing..." : "Order Now"}
                      </Button>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
