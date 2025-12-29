import { pool } from "./db";

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("Worker DB connected");

    // keep process alive
    setInterval(() => {}, 1 << 30);
  } catch (err) {
    console.error("Worker failed to start", err);
    process.exit(1);
  }
}

start();
