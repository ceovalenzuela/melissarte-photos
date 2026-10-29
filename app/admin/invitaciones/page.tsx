import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InvitationDraftAdmin from "@/components/invitations/InvitationDraftAdmin";

export const metadata = { title: "Borradores de invitaciones | Administración", robots: { index: false, follow: false } };

export default async function InvitationDraftsAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: allowed, error } = await supabase.rpc("is_invitation_draft_admin");
  if (error || allowed !== true) redirect("/admin");
  return <InvitationDraftAdmin />;
}
