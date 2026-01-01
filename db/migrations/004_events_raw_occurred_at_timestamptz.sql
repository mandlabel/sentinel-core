-- Preserve absolute event time by storing occurred_at with timezone

ALTER TABLE events_raw
ALTER COLUMN occurred_at
TYPE TIMESTAMPTZ
USING occurred_at AT TIME ZONE 'UTC';
