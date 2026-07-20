"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { generateSlug } from "@/lib/slug";

import { Event } from "@/types/event";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    setEvents(data ?? []);
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

          event_type: null,
          display_name: null,
          welcome_message: null,
          cover_image: null,

          is_active: true,
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