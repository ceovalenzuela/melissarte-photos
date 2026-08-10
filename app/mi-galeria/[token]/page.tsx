import { notFound, redirect } from "next/navigation";

import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{
    token: string;
  }>;
}

export default async function OrganizerEntryPage({
  params,
}: Props) {
  const { token } = await params;

  const { data, error } = await supabase.rpc(
    "get_event_by_organizer_token",
    {
      p_token: token,
    }
  );

  if (error) {
    console.error("Error validando organizer token:", error);
    notFound();
  }

  const event = data?.[0];

  if (!event) {
    notFound();
  }

  redirect(`/dashboard/${event.slug}?token=${token}`);
}