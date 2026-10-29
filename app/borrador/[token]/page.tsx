import InvitationDraftEditor from "@/components/invitations/InvitationDraftEditor";

export const metadata = {
  title: "Mi invitación digital | Melissarte Events",
  robots: { index: false, follow: false },
};

export default async function DraftPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return <main className="min-h-screen bg-[#F8F6F2] p-8 text-center">Enlace no válido.</main>;
  }
  return <InvitationDraftEditor token={token} />;
}
