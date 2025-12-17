"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, ShoppingCart, MapPin } from "lucide-react";
import { deliveryItems, hostels } from "@/lib/data";

interface DeliveryScreenProps {
  cartItems: Record<string, number>;
  onUpdateQuantity: (itemId: string, change: number) => void;
  onProceedToCart: () => void;
  totals: { totalItems: number; totalPrice: number };
  selectedHostel: string;
  setSelectedHostel: (hostel: string) => void;
  roomNumber: string;
  setRoomNumber: (room: string) => void;
}

export function DeliveryScreen({
  cartItems,
  onUpdateQuantity,
  onProceedToCart,
  totals,
  selectedHostel,
  setSelectedHostel,
  roomNumber,
  setRoomNumber,
}: DeliveryScreenProps) {
  const { totalItems, totalPrice } = totals;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">SnackHub</h1>
            <p className="text-xs opacity-80">Snacks delivered to your room</p>
          </div>
          <button
            onClick={onProceedToCart}
            className="relative cursor-pointer hover:scale-110 transition-transform"
          >
            <ShoppingCart
              className={`w-6 h-6 ${totalItems > 0 ? "animate-pulse" : ""}`}
            />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Location Selector */}
        <div className="bg-primary-foreground/10 rounded-xl p-3 space-y-2 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm opacity-90">
            <MapPin className="w-4 h-4" />
            <span>Delivering to</span>
          </div>
          <div className="flex gap-2">
            <Select value={selectedHostel} onValueChange={setSelectedHostel}>
              <SelectTrigger className="flex-1 bg-background text-foreground border-0 shadow-sm">
                <SelectValue placeholder="Select Hostel" />
              </SelectTrigger>
              <SelectContent>
                {hostels.map((hostel) => (
                  <SelectItem key={hostel} value={hostel}>
                    {hostel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="text"
              placeholder="Room"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              className="w-20 bg-background text-foreground border-0 shadow-sm"
            />
          </div>
          {selectedHostel && roomNumber && (
            <p className="text-xs opacity-90 animate-in fade-in-50 slide-in-from-top-2">
              📍 Room {roomNumber}, {selectedHostel}
            </p>
          )}
        </div>
      </div>

      {/* Ad Placeholder */}
      <div className="bg-gradient-to-r from-accent/20 to-primary/20 border border-border m-4 rounded-xl p-6 text-center shadow-sm">
        <p className="text-sm font-medium">
          Special Offer: Free delivery on orders above ₹100
        </p>
      </div>

      {/* Items List */}
      <div className="px-4 pb-24 space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">Packaged Snacks</h2>
          <span className="text-xs text-muted-foreground">
            {deliveryItems.length} items
          </span>
        </div>
        {deliveryItems.map((item, index) => (
          <Card
            key={item.id}
            className="p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center text-4xl shadow-sm">
                {item.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">{item.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">
                    ₹{item.price}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium shadow-sm ${
                      item.availability === "available"
                        ? "bg-success/20 text-success border border-success/30"
                        : item.availability === "limited"
                        ? "bg-warning/20 text-warning border border-warning/30"
                        : "bg-destructive/20 text-destructive border border-destructive/30"
                    }`}
                  >
                    {item.availability === "available"
                      ? "✓ Available"
                      : item.availability === "limited"
                      ? "⚠ Limited"
                      : "✗ Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
            {item.availability !== "unavailable" && (
              <div className="mt-3 flex items-center justify-end">
                {(cartItems[item.id] || 0) === 0 ? (
                  <Button
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 bg-accent rounded-xl px-4 py-2 shadow-md animate-in zoom-in-90">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="text-accent-foreground hover:scale-110 transition-transform active:scale-95"
                      title="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-accent-foreground w-6 text-center text-lg">
                      {cartItems[item.id]}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="text-accent-foreground hover:scale-110 transition-transform active:scale-95"
                      title="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-20 left-0 right-0 p-4 animate-in slide-in-from-bottom-4">
          <Button
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 rounded-xl shadow-lg font-bold text-lg flex items-center justify-between hover:scale-[1.02] transition-all active:scale-95"
            onClick={onProceedToCart}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <span>{totalItems} items</span>
            </div>
            <span>Proceed • ₹{totalPrice}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
