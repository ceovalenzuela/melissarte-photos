"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/slug";

import { Event } from "@/types/event";
import { EventWithStats } from "@/types/event-with-stats";
import {
  getPhotoCounts,
} from "@/lib/events";

export function useEvents() {
  const [events, setEvents] =
  useState<EventWithStats[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadEvents() {

const {
  data: { session },
} = await supabase.auth.getSession();

const {
  data: { user },
} = await supabase.auth.getUser();

    const { data, error } = await supabase
  .from("events")
  .select("*")
  .order("created_at", { ascending: false });

console.log("ERROR:", error);

    const counts = await getPhotoCounts();

const eventsWithStats = (data ?? []).map(
  (event) => ({
    ...event,
    photoCount:
      counts[event.id] ?? 0,
  })
);

setEvents(eventsWithStats);
  }

  async function createEvent(data: {
    title: string;
    event_date: string;
  }) {
    setLoading(true);

    try {
      const { error } = await supabase
  .from("events")
  .insert({
    title: data.title,
    slug: generateSlug(data.title),
    event_date: data.event_date,
  });

      if (error) throw error;

      await loadEvents();
    } finally {
      setLoading(false);
    }
  }

  async function updateEvent(
    id: string,
    updates: Partial<Event>
  ) {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("events")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      await loadEvents();
    } finally {
      setLoading(false);
    }
  }

async function deleteEvent(id: string) {
  setLoading(true);

  try {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await loadEvents();
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadEvents();
  }, []);

  return {
    events,
    loading,

    createEvent,
    updateEvent,
    deleteEvent,

    refresh: loadEvents,
  };
}