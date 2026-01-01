import { pool } from "./db";
import { computeFingerprint } from "./fingerprint";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";

type EventRow = {
  id: string;
  project_id: string;
  event_type: "error" | "transaction";
  occurred_at: string;
  payload: any;
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function truncateToMinute(ts: string): Date {
  const d = new Date(ts);
  d.setSeconds(0, 0);
  return d;
}

async function fetchUnprocessedEvents(): Promise<EventRow[]> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query<EventRow>(`
      SELECT id, project_id, event_type, occurred_at, payload
      FROM events_raw
      WHERE processed = false
      ORDER BY received_at
      LIMIT 10
      FOR UPDATE SKIP LOCKED
    `);

    await client.query("COMMIT");
    return result.rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function handleErrorEventTx(
  client: PoolClient,
  event: EventRow
) {
  const { exception_type, stacktrace } = event.payload ?? {};

  if (!exception_type || !stacktrace) {
    return;
  }

  const fingerprint = computeFingerprint(exception_type, stacktrace);

  await client.query(
    `
    INSERT INTO error_groups (
      id,
      project_id,
      fingerprint,
      first_seen,
      last_seen,
      occurrence_count
    )
    VALUES ($1, $2, $3, $4, $4, 1)
    ON CONFLICT (project_id, fingerprint)
    DO UPDATE SET
      last_seen = EXCLUDED.last_seen,
      occurrence_count = error_groups.occurrence_count + 1
    `,
    [
      randomUUID(),
      event.project_id,
      fingerprint,
      event.occurred_at
    ]
  );
}

async function updateErrorMetricsTx(
  client: PoolClient,
  event: EventRow
) {
  const minute = truncateToMinute(event.occurred_at);

  await client.query(
    `
    INSERT INTO metrics_minute (
      project_id,
      minute,
      error_count
    )
    VALUES ($1, $2, 1)
    ON CONFLICT (project_id, minute)
    DO UPDATE SET
      error_count = metrics_minute.error_count + 1
    `,
    [event.project_id, minute]
  );
}

async function processEvent(event: EventRow) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (event.event_type === "error") {
      await handleErrorEventTx(client, event);
      await updateErrorMetricsTx(client, event);
    }

    await client.query(
      `
      UPDATE events_raw
      SET processed = true
      WHERE id = $1
      `,
      [event.id]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Worker DB connected");

    while (true) {
      const events = await fetchUnprocessedEvents();

      if (events.length === 0) {
        await sleep(1000);
        continue;
      }

      for (const event of events) {
        await processEvent(event);
      }
    }
  } catch (err) {
    console.error("Worker failed to start", err);
    process.exit(1);
  }
}

start();
