-- Enforce uniqueness of error groups per project and fingerprint

CREATE UNIQUE INDEX IF NOT EXISTS
error_groups_project_fingerprint_idx
ON error_groups (project_id, fingerprint);
