import { notFound } from "next/navigation";

import PublicInvitationClient from "@/components/invitations/PublicInvitationClient";
import { getPublicInvitationBySlug, getRSVPForEdit } from "@/lib/invitations";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ rsvp?: string | string[]; token?: string | string[] }>;
}

export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const invitation = await getPublicInvitationBySlug(slug);

  if (!invitation) notFound();

  const responseId = typeof query.rsvp === "string" ? query.rsvp : null;
  const editToken = typeof query.token === "string" ? query.token : null;
  const editRequested = Boolean(responseId || editToken);

  let existingRSVP = null;
  if (
    responseId &&
    editToken &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(responseId) &&
    /^[a-f0-9]{64}$/.test(editToken)
  ) {
    existingRSVP = await getRSVPForEdit(slug, responseId, editToken);
  }

  return (
    <PublicInvitationClient
      invitation={invitation}
      existingRSVP={existingRSVP}
      editToken={existingRSVP ? editToken : null}
      editRequested={editRequested}
    />
  );
}
