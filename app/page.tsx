"use client"

import { useState } from "react"
import { DeliveryScreen } from "@/components/delivery-screen"
import { VendingScreen } from "@/components/vending-screen"
import { EventsScreen } from "@/components/events-screen"
import { BottomNav } from "@/components/bottom-nav"

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<"delivery" | "vending" | "events">("delivery")

  return (
    <div className="min-h-screen bg-background pb-20 max-w-[430px] mx-auto">
      {activeScreen === "delivery" && <DeliveryScreen />}
      {activeScreen === "vending" && <VendingScreen />}
      {activeScreen === "events" && <EventsScreen />}

      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  )
}
