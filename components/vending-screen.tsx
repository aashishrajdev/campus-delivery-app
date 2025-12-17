"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { vendingMachines } from "@/lib/data"
import { ChevronRight, MapPin, ArrowLeft } from "lucide-react"

export function VendingScreen() {
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null)

  const selected = vendingMachines.find((m) => m.id === selectedMachine)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold">Vending Machines</h1>
        <p className="text-xs opacity-80 mt-1">Check real-time availability</p>
      </div>

      {/* Ad Placeholder */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-border m-4 rounded-xl p-6 text-center shadow-sm">
        <p className="text-sm font-medium">Pay via UPI • Get instant snacks</p>
      </div>

      <div className="px-4 pb-4">
        {!selectedMachine ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Select a Machine</h2>
              <span className="text-xs text-muted-foreground">{vendingMachines.length} machines</span>
            </div>
            {vendingMachines.map((machine, index) => (
              <Card
                key={machine.id}
                className="p-4 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-accent animate-in fade-in-50 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedMachine(machine.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent/30 to-primary/30 rounded-xl flex items-center justify-center text-2xl">
                      🏪
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{machine.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>
                          {machine.location}, {machine.hostel}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-accent font-medium">{machine.items.length} items available</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="animate-in fade-in-50 slide-in-from-right-4">
            <button
              onClick={() => setSelectedMachine(null)}
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
                  <h2 className="text-lg font-bold">{selected?.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    📍 {selected?.location}, {selected?.hostel}
                  </p>
                </div>
              </div>
            </Card>

            <h3 className="text-base font-bold mb-3">Available Items</h3>
            <div className="space-y-3">
              {selected?.items.map((item, index) => (
                <Card
                  key={item.id}
                  className="p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-in fade-in-50 slide-in-from-right-4"
                  style={{ animationDelay: `${index * 75}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl flex items-center justify-center text-4xl shadow-sm">
                      {item.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{item.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-lg text-primary">₹{item.price}</span>
                        <span
                          className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm transition-all ${
                            item.stock === "in-stock"
                              ? "bg-success/20 text-success border border-success/30"
                              : item.stock === "low"
                                ? "bg-warning/20 text-warning border border-warning/30 animate-pulse"
                                : "bg-destructive/20 text-destructive border border-destructive/30"
                          }`}
                        >
                          {item.stock === "in-stock"
                            ? "✓ In Stock"
                            : item.stock === "low"
                              ? "⚠ Low Stock"
                              : "✗ Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
