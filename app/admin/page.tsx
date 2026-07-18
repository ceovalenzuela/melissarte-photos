"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Event = {
  id: string;
  title: string;
  slug: string;
  event_date: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  async function loadEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setEvents(data || []);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function createEvent() {
    if (!title.trim()) {
      alert("Escribe un nombre para el evento.");
      return;
    }

    setLoading(true);

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

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("¡Evento creado!");

    setTitle("");
    setEventDate("");

    await loadEvents();
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 700 }}>
      <h1>Panel de Administración</h1>

      <div style={{ marginTop: 30 }}>
        <label>Nombre del evento</label>
        <br />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 5,
          }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Fecha</label>
        <br />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginTop: 5,
          }}
        />
      </div>

      <button
        onClick={createEvent}
        disabled={loading}
        style={{
          marginTop: 30,
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        {loading ? "Guardando..." : "+ Crear evento"}
      </button>

      <hr style={{ margin: "40px 0" }} />

      <h2>Eventos creados</h2>

      {events.length === 0 ? (
        <p>No hay eventos registrados.</p>
      ) : (
        <ul style={{ padding: 0, listStyle: "none" }}>
          {events.map((event) => (
            <li
              key={event.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 15,
                marginBottom: 15,
              }}
            >
              <strong>{event.title}</strong>

              <br />

              <small>
                Fecha: {event.event_date ?? "Sin fecha"}
              </small>

              <br />

              <small>
                URL: /e/{event.slug}
              </small>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}