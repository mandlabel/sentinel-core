import Fastify from "fastify";

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

app.post("/api/events", { schema: eventSchema }, async (_req, reply) => {
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
