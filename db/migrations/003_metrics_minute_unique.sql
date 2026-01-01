-- Enforce uniqueness of metrics minute per project

ALTER TABLE metrics_minute
ADD CONSTRAINT metrics_minute_project_minute_key
UNIQUE (project_id, minute);
