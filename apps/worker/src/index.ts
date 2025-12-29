import { pool } from "./db";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchUnprocessedEvents() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const result = await client.query<{ id: string }>(`
      SELECT id
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

async function markProcessed(id: string) {
  await pool.query(
    `
    UPDATE events_raw
    SET processed = true
    WHERE id = $1
    `,
    [id]
  );
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
        await markProcessed(event.id);
      }
    }
  } catch (err) {
    console.error("Worker failed to start", err);
    process.exit(1);
  }
}

start();
