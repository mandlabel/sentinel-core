import Fastify from "fastify";
import crypto from "node:crypto";
import { pool } from "./db";

const app = Fastify({ logger: true });

const eventSchema = {
  body: {
    type: "object",
    required: ["project_id", "type", "occurred_at", "payload"],
    properties: {
      project_id: { type: "string" },
      type: { enum: ["error", "transaction"] },
      occurred_at: { type: "string" },
      payload: { type: "object" }
    },
    additionalProperties: false
  }
};

app.post("/api/events", { schema: eventSchema }, async (req, reply) => {
  const body = req.body as any;
  
  await pool.query(
    `
    INSERT INTO events_raw (
      id,
      project_id,
      event_type,
      occurred_at,
      payload,
      processed
    )
    VALUES ($1, $2, $3, $4, $5, false)
    `,
    [
      crypto.randomUUID(),
      body.project_id,
      body.type,
      body.occurred_at,
      body.payload
    ]
  );

  return reply.code(200).send({ status: "accepted" });
});

async function start() {
  try {
    const address = await app.listen({
      port: 3000,
      host: "0.0.0.0"
    });

    console.log(`Ingestion API listening at ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

await pool.query("SELECT 1");
console.log("DB connected");
