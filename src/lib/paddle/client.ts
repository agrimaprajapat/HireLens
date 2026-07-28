import "server-only";

import { Environment, Paddle } from "@paddle/paddle-node-sdk";

/**
 * Server-only Paddle client factory.
 *
 * Reads and validates configuration from the environment, then constructs a
 * single reused client. Initialization is lazy so a missing/invalid variable
 * surfaces as a clear developer error at call time (to be caught upstream and
 * turned into a friendly response) rather than crashing the server at import.
 * Mirrors the pattern used by `src/lib/ai/azure-openai.ts`.
 */

interface PaddleConfig {
  apiKey: string;
  environment: Environment;
}

function readConfig(): PaddleConfig {
  const apiKey = process.env.PADDLE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "Missing PADDLE_API_KEY. Add it to .env.local (see .env.example)."
    );
  }

  const rawEnv = process.env.NEXT_PUBLIC_PADDLE_ENV?.trim() ?? "sandbox";
  if (rawEnv !== "sandbox" && rawEnv !== "production") {
    throw new Error(
      `Invalid NEXT_PUBLIC_PADDLE_ENV "${rawEnv}". Expected "sandbox" or "production".`
    );
  }

  return {
    apiKey,
    environment:
      rawEnv === "production" ? Environment.production : Environment.sandbox,
  };
}

let cached: Paddle | null = null;

/**
 * Return the shared, server-only Paddle client.
 * Throws a descriptive error if configuration is incomplete or invalid.
 */
export function getPaddle(): Paddle {
  if (!cached) {
    const config = readConfig();
    cached = new Paddle(config.apiKey, { environment: config.environment });
  }
  return cached;
}
