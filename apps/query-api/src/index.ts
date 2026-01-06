import Fastify from "fastify";
import { pool } from "./db";

const app = Fastify({ logger: true });

/**
 * Health check
 * Used by humans and tooling to verify the service is alive.
 */

app.get("/health", async () => {
  return { status: "ok" };
});

/**
 * GET /api/metrics/errors
 *
 * Returns minute-level error counts for a project
 *
 * Query params:
 * - project_id (uuid, required)
 * - from (ISO 8601 UTC, required)
 * - to (ISO 8601 UTC, required)
 */
app.get("/api/metrics/errors", async (req, reply) => {
  const { project_id, from, to } = req.query as {
    project_id?: string;
    from?: string;
    to?: string;
  };

  // --- validation ---
  if (!project_id || !from || !to) {
    return reply.code(400).send({
      error: "project_id, from and to are required"
    });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return reply.code(400).send({
      error: "from and to must be valid ISO timestamps"
    });
  }

  if (fromDate >= toDate) {
    return reply.code(400).send({
      error: "`from` must be earlier than `to`"
    });
  }

  // --- query ---
  const result = await pool.query<{
    minute: string;
    error_count: number;
  }>(
    `
    SELECT
      minute,
      error_count
    FROM metrics_minute
    WHERE project_id = $1
      AND minute >= $2
      AND minute < $3
    ORDER BY minute ASC
    `,
    [project_id, fromDate.toISOString(), toDate.toISOString()]
  );

  return {
    data: result.rows
  };
});

/**
 * GET /api/errors/groups
 *
 * Returns most frequent error groups for a project
 *
 * Query params:
 * - project_id (uuid, required)
 * - limit (number, optional, default 20, max 100)
 */
app.get("/api/errors/groups", async (req, reply) => {
  const { project_id, limit } = req.query as {
    project_id?: string;
    limit?: string;
  };

  if (!project_id) {
    return reply.code(400).send({
      error: "project_id is required"
    });
  }

  const parsedLimit = limit ? Number(limit) : 20;

  if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
    return reply.code(400).send({
      error: "limit must be a number between 1 and 100"
    });
  }

  const result = await pool.query<{
    fingerprint: string;
    occurrence_count: number;
    first_seen: string;
    last_seen: string;
  }>(
    `
    SELECT
      fingerprint,
      occurrence_count,
      first_seen,
      last_seen
    FROM error_groups
    WHERE project_id = $1
    ORDER BY occurrence_count DESC
    LIMIT $2
    `,
    [project_id, parsedLimit]
  );

  return {
    data: result.rows
  };
});

/**
 * Startup
 */
async function start() {
  try {
    // verify DB connectivity on startup
    await pool.query("SELECT 1");

    const address = await app.listen({
      port: 3001,
      host: "0.0.0.0"
    });

    console.log(`Query API listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
