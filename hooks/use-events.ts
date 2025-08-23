"use client"

import { useState, useEffect } from "react"
import type { Event } from "@/types/event"
// Usar Supabase em vez do SQLite
import { eventClientService } from "@/lib/supabase/client-services"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)

      // Obter eventos usando o serviço de cliente
      const eventsData = await eventClientService.getAll()
      setEvents(eventsData)
    } catch (error) {
      console.error("Error loading events:", error)
      setError(error instanceof Error ? error.message : "Failed to load events")
    } finally {
      setLoading(false)
    }
  }

  const addEvent = async (eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Criar evento usando o serviço de cliente
      const newEvent = await eventClientService.create(eventData)
      
      if (newEvent) {
        setEvents((prev) => [...prev, newEvent])
      }
    } catch (error) {
      console.error("Error adding event:", error)
      setError(error instanceof Error ? error.message : "Failed to add event")
    }
  }

  const updateEvent = async (id: string, eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Atualizar evento usando o serviço de cliente
      const updatedEvent = await eventClientService.update(id, eventData)
      
      if (!updatedEvent) throw new Error("Failed to update event")

      setEvents((prev) =>
        prev.map((event) => event.id === id ? updatedEvent : event)
      )
    } catch (error) {
      console.error("Error updating event:", error)
      setError(error instanceof Error ? error.message : "Failed to update event")
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      // Excluir evento usando o serviço de cliente
      const success = await eventClientService.delete(id)
      
      if (!success) throw new Error("Failed to delete event")

      setEvents((prev) => prev.filter((event) => event.id !== id))
    } catch (error) {
      console.error("Error deleting event:", error)
      setError(error instanceof Error ? error.message : "Failed to delete event")
    }
  }

  const getEventById = (id: string) => {
    return events.find((event) => event.id === id)
  }

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    refetch: loadEvents,
  }
}
