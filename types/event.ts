export interface Event {
  id: string;
  title: string;
  slug: string;
  event_date: string;

  type: string | null;
  status: "draft" | "published";

  welcome_message: string | null;

  cover_image: string | null;
  cover_position_y: number;

  created_at: string;
}