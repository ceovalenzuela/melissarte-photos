export interface Event {
  id: string;
  title: string;
  slug: string;

  event_type: string | null;
  display_name: string | null;
  welcome_message: string | null;
  cover_image: string | null;

  event_date: string | null;
  is_active: boolean;

  created_at: string;
}