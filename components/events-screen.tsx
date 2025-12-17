"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { events } from "@/lib/data"
import { Calendar, MapPin, ExternalLink } from "lucide-react"

export function EventsScreen() {
  const today = new Date().toDateString()

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <h1 className="text-2xl font-bold">Campus Events</h1>
        <p className="text-sm opacity-90 mt-1">Discover & register</p>
      </div>

      {/* Ad Placeholder */}
      <div className="bg-muted border border-border m-4 rounded-lg p-4 text-center">
        <p className="text-muted-foreground text-sm">Advertisement Banner</p>
      </div>

      <div className="px-4 pb-4 space-y-4">
        {/* Today's Events */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Happening Today</h2>
          {events
            .filter((event) => new Date(event.date).toDateString() === today)
            .map((event) => (
              <EventCard key={event.id} event={event} isToday />
            ))}
          {events.filter((event) => new Date(event.date).toDateString() === today).length === 0 && (
            <p className="text-muted-foreground text-sm">No events today</p>
          )}
        </div>

        {/* Upcoming Events */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Upcoming Events</h2>
          <div className="space-y-3">
            {events
              .filter((event) => new Date(event.date) > new Date())
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, isToday = false }: { event: any; isToday?: boolean }) {
  return (
    <Card className="overflow-hidden shadow-sm mb-3">
      <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
        {event.emoji}
      </div>
      <div className="p-4">
        {isToday && (
          <span className="inline-block bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full font-medium mb-2">
            Today
          </span>
        )}
        <h3 className="font-bold text-lg mb-2">{event.name}</h3>
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(event.date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              at {event.time}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{event.venue}</span>
          </div>
        </div>
        <Button
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
          onClick={() => window.open(event.registrationLink, "_blank")}
        >
          Register Now
          <ExternalLink className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </Card>
  )
}
