"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deliveryItems, hostels } from "@/lib/data";
import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Edit2,
  MapPin,
  Check,
} from "lucide-react";

interface CartScreenProps {
  cartItems: Record<string, number>;
  onUpdateQuantity: (itemId: string, change: number) => void;
  onGoToDelivery: () => void;
  totals: { totalItems: number; totalPrice: number };
  selectedHostel: string;
  setSelectedHostel: (hostel: string) => void;
  roomNumber: string;
  setRoomNumber: (room: string) => void;
  onSaveAddress?: (hostel: string, room: string) => Promise<void> | void;
}

export function CartScreen({
  cartItems,
  onUpdateQuantity,
  onGoToDelivery,
  totals,
  selectedHostel,
  setSelectedHostel,
  roomNumber,
  setRoomNumber,
  onSaveAddress,
}: CartScreenProps) {
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempHostel, setTempHostel] = useState(selectedHostel);
  const [tempRoom, setTempRoom] = useState(roomNumber);
  const itemsInCart = deliveryItems.filter((item) => cartItems[item.id]);
  const { totalItems, totalPrice } = totals;
  const deliveryFee = totalPrice > 0 ? 10 : 0;
  const payable = totalPrice + deliveryFee;

  const handleSaveAddress = () => {
    if (tempHostel && tempRoom) {
      setSelectedHostel(tempHostel);
      setRoomNumber(tempRoom);
      setIsEditingAddress(false);
      onSaveAddress?.(tempHostel, tempRoom);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="sticky top-0 bg-background/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <Button variant="ghost" size="icon" onClick={onGoToDelivery}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Your cart</p>
            <p className="text-lg font-semibold">
              {totalItems} item{totalItems === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Address Confirmation Card */}
        <Card className="p-4 shadow-sm border-primary/20">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Delivery Address</h3>
              </div>
              {!isEditingAddress && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingAddress(true)}
                  className="hover:bg-accent/20"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>

            {!isEditingAddress ? (
              // Display Mode
              selectedHostel && roomNumber ? (
                <div className="bg-accent/10 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-medium">📍 Room {roomNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedHostel}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Please select a hostel and room number
                </p>
              )
            ) : (
              // Edit Mode
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Select value={tempHostel} onValueChange={setTempHostel}>
                    <SelectTrigger className="flex-1 bg-background border-border">
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
                    value={tempRoom}
                    onChange={(e) => setTempRoom(e.target.value)}
                    className="w-24 bg-background border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setTempHostel(selectedHostel);
                      setTempRoom(roomNumber);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!tempHostel || !tempRoom}
                    onClick={handleSaveAddress}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
        {itemsInCart.length === 0 ? (
          <Card className="p-6 text-center space-y-3 shadow-sm">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground" />
            <h2 className="text-lg font-semibold">No items yet</h2>
            <p className="text-sm text-muted-foreground">
              Add snacks from Delivery and they will appear here for checkout.
            </p>
            <Button className="w-full" onClick={onGoToDelivery}>
              Browse snacks
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="divide-y divide-border shadow-sm">
              {itemsInCart.map((item) => (
                <div key={item.id} className="flex gap-3 p-4">
                  <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center text-2xl">
                    {item.emoji}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <span className="font-semibold text-primary">
                        ₹{item.price}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-accent rounded-xl px-3 py-2 shadow-inner">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="text-accent-foreground hover:scale-110 transition-transform active:scale-95"
                          title="Decrease quantity"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-accent-foreground w-6 text-center">
                          {cartItems[item.id]}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="text-accent-foreground hover:scale-110 transition-transform active:scale-95"
                          title="Increase quantity"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ₹{item.price * (cartItems[item.id] || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <Card className="p-4 space-y-3 shadow-sm">
              <h3 className="text-base font-semibold">Order summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Items total</span>
                  <span>₹{totalPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery fee</span>
                  <span className={deliveryFee === 0 ? "text-success" : ""}>
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-semibold text-base">
                  <span>Payable</span>
                  <span>₹{payable}</span>
                </div>
              </div>
              <Button
                className="w-full py-6 text-base"
                disabled={totalItems === 0}
              >
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Checkout
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Cash on delivery • Delivery in 20-30 mins
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
