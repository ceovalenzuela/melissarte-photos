import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function LegacyOrganizerConfirmationsPage({ params }: Props) {
  const { token } = await params;
  redirect("/rsvp/" + token);
}
