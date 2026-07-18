"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Event } from "@/types/event";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setEvents(data ?? []);
    setLoading(false);
  }

  async function createEvent(title: string, eventDate: string) {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("events").insert({
      title,
      slug,
      event_date: eventDate || null,
    });

    if (error) throw error;

    await loadEvents();
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,
    createEvent,
    refresh: loadEvents,
  };
}