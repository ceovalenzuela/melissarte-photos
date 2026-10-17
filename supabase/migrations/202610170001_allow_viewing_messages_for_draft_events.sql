-- Keep previously submitted text and voice messages visible when an event is in draft.
-- New messages and voice uploads remain restricted to published events by INSERT policies.
DROP POLICY IF EXISTS "Public can read messages from published events" ON public.messages;

CREATE POLICY "Public can read messages"
ON public.messages
FOR SELECT
TO anon, authenticated
USING (true);
