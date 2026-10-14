import { createClient } from "@/lib/supabase/server";
import type { PublicInvitation, RSVPResponse } from "@/types/invitation";

export async function getPublicInvitationBySlug(
  slug: string
): Promise<PublicInvitation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_invitation_by_slug", {
    p_slug: slug,
  });

  if (error) {
    console.error("ERROR get_public_invitation_by_slug:", error.message);
    return null;
  }

  return (data?.[0] as PublicInvitation | undefined) ?? null;
}

export async function getRSVPForEdit(
  slug: string,
  responseId: string,
  editToken: string
): Promise<RSVPResponse | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invitation_rsvp_for_edit", {
    p_invitation_slug: slug,
    p_response_id: responseId,
    p_edit_token: editToken,
  });

  if (error) {
    console.error("ERROR get_invitation_rsvp_for_edit:", error.message);
    return null;
  }

  return (data?.[0] as RSVPResponse | undefined) ?? null;
}
