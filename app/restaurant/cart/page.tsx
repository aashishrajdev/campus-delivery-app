"use client";

import { useCart } from "@/app/context/CartContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrder, verifyPayment } from "@/app/actions/order-actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hostels } from "@/lib/data";
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  Banknote,
  Loader2,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    totals,
    selectedHostel,
    setSelectedHostel,
    roomNumber,
    setRoomNumber,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "ONLINE">("COD");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const user = JSON.parse(jsonPayload);
        if (user.name) setUserName(user.name);
      } catch (e) {
        console.error("Failed to decode token for name", e);
      }
    }
  }, []);

  const totalAmount = totals.totalPrice;
  const deliveryFee = totalAmount > 100 ? 0 : 20;
  const grandTotal = totalAmount + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedHostel || !roomNumber) {
      toast.error("Please provide your complete delivery address.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const address = `${roomNumber}, ${selectedHostel}`;

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to place an order.");
        router.push("/login");
        return;
      }

      let userId;
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const user = JSON.parse(jsonPayload);
        userId = user.userId || user.id;
      } catch (e) {
        console.error("Token decode failed", e);
        toast.error("Session invalid. Please login again.");
        return;
      }

      const result = await createOrder({
        userId,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          source: item.source,
          sourceId: item.sourceId,
          sourceModel: item.sourceModel,
          itemModel: item.source === 'STORE' ? 'Product' : 'VendingItem'
        })),
        totalAmount: grandTotal,
        paymentMethod,
        address
      });

      if (result.success) {
        if (paymentMethod === "ONLINE" && result.razorpayOrder?.id) {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
            amount: grandTotal * 100,
            currency: "INR",
            name: "SnackHub Campus Delivery",
            description: "Order Payment",
            order_id: result.razorpayOrder.id,
            handler: async function (response: any) {
              const verify = await verifyPayment({
                orderId: result.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              if (verify.success) {
                toast.success("Payment successful! Order placed.");
                clearCart();
                router.push("/restaurant/profile");
              } else {
                toast.error("Payment verification failed.");
              }
            },
            prefill: {
              name: "Student", // Could fetch from profile if needed
              contact: ""
            },
            theme: {
              color: "#3399cc"
            }
          };
          const rzp1 = new window.Razorpay(options);
          rzp1.open();
        } else {
          // COD
          toast.success("Order placed successfully!");
          clearCart();
          router.push("/restaurant/profile");
        }
      } else {
        toast.error("Failed to create order: " + result.error);
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null;

  return (
    <div className="bg-background min-h-screen pb-20">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="bg-primary p-4 sticky top-0 z-10 shadow-md flex items-center gap-3 text-primary-foreground">
        <button
          onClick={() => router.back()}
          className="hover:scale-110 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Checkout</h1>
        {userName && (
          <span className="ml-auto text-sm bg-primary-foreground/20 px-3 py-1 rounded-full">
            Hi, {userName}
          </span>
        )}
      </div>

      <div className="p-4 space-y-6 max-w-2xl mx-auto">

        {/* Cart Items */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            Order Summary
            <span className="text-sm font-normal text-muted-foreground">({cartItems.length} items)</span>
          </h2>

          {cartItems.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground border-dashed">
              Your cart is empty.
              <Button variant="link" onClick={() => router.push('/restaurant')} className="mt-2 text-primary">Browse Snacks</Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <Card key={item.productId} className="p-3 flex gap-3 items-center hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>🍔</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {item.source === 'STORE' ? 'Store Item' : 'Vending Machine'}
                    </p>
                    <div className="font-medium text-primary mt-1">₹{item.price * item.quantity}</div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-muted/50 p-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-background rounded-md transition-colors"
                    >
                      <Minus className="w-4 h-4 cursor-pointer" />
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-background rounded-md transition-colors"
                    >
                      <Plus className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Address */}
        {cartItems.length > 0 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 delay-100">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Delivery Details
            </h2>
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Select Hostel / Building</Label>
                <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map(h => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Room Number / Location</Label>
                <Input
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 304, Block A"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Bill Details */}
        {cartItems.length > 0 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 delay-200">
            <h2 className="text-lg font-bold">Bill Summary</h2>
            <Card className="p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item Total</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-success font-medium" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Payment Method */}
        {cartItems.length > 0 && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-bottom-4 delay-300">
            <h2 className="text-lg font-bold">Payment Method</h2>
            <Card className="p-4">
              <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="COD" id="cod" />
                  <Label htmlFor="cod" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <Banknote className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-semibold">Pay on Delivery</div>
                      <div className="text-xs text-muted-foreground">Cash or UPI at door</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="ONLINE" id="online" />
                  <Label htmlFor="online" className="flex-1 flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-semibold">Pay Online</div>
                      <div className="text-xs text-muted-foreground">Cards, UPI, Netbanking</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-top z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Total to Pay</p>
              <p className="text-xl font-bold">₹{grandTotal}</p>
            </div>
            <Button
              size="lg"
              onClick={handlePlaceOrder}
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-xl font-bold shadow-lg disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Place Order
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
