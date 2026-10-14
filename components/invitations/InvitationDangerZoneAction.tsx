"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Props {
  eventId: string;
  organizerToken: string;
}

export default function InvitationDangerZoneAction({ eventId, organizerToken }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Eliminar únicamente la invitación digital?\n\nSe eliminarán la invitación y todas sus confirmaciones de asistencia. El evento, la galería, las fotografías, los recuerdos y sus enlaces actuales se conservarán. Esta acción no se puede deshacer."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const { data, error } = await supabase.rpc("delete_invitation_with_token", {
        p_event_id: eventId,
        p_organizer_token: organizerToken,
      });
      if (error) throw error;
      if (data !== true) {
        toast.error("No hay una invitación que eliminar.");
        return;
      }
      toast.success("Invitación eliminada. El evento y la galería siguen intactos.");
      router.refresh();
    } catch (error) {
      console.error("Error eliminando invitación:", error);
      toast.error("No fue posible eliminar la invitación.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#E7C9C4] bg-[#FFF9F8] p-6 shadow-sm">
      <h3 className="text-base font-semibold text-[#7D403A]">Eliminar invitación digital</h3>
      <p className="mt-1.5 text-sm text-[#8B665F]">Elimina la invitación y sus confirmaciones. No elimina el evento, las fotografías ni los recuerdos de la galería.</p>
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={deleting}
        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#D9A8A1] px-5 text-sm font-semibold text-[#8C3731] transition hover:bg-[#FBEAE7] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={15} /> {deleting ? "Eliminando..." : "Eliminar invitación"}
      </button>
    </div>
  );
}
