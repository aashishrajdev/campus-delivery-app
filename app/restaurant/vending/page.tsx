"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VendingPage() {
  const router = useRouter();

  // Static locations for now as per original code
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

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold">Vending Machines</h1>
        <p className="text-xs opacity-80 mt-1">
          Same products • Instant access
        </p>
      </div>

      {/* Ad Placeholder */}
      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-border m-4 rounded-xl p-6 text-center shadow-sm">
        <p className="text-sm font-medium">
          Same products • Fast delivery • 24/7
        </p>
      </div>

      <div className="px-4 pb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Select a Machine</h2>
            <span className="text-xs text-muted-foreground">
              {vendingLocations.length} machines
            </span>
          </div>
          {vendingLocations.map((machine, index) => (
            <Card
              key={machine.id}
              className="p-4 shadow-sm cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-accent animate-in fade-in-50 slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => router.push(`/restaurant/vending/${machine.id}`)}
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
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
