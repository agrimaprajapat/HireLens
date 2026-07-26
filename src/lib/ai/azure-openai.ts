import "server-only";

import { AzureOpenAI } from "openai";

/**
 * Azure OpenAI client factory.
 *
 * Reads configuration from the environment and constructs a single, reused
 * client. Initialization is lazy so a missing variable surfaces as a clear
 * developer error at call time (caught upstream and turned into a friendly
 * response) rather than crashing the server at import.
 */

interface AzureConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

const REQUIRED_VARS = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_API_KEY",
  "AZURE_OPENAI_DEPLOYMENT",
  "AZURE_OPENAI_API_VERSION",
] as const;

function readConfig(): AzureConfig {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing Azure OpenAI environment variable(s): ${missing.join(
        ", "
      )}. Add them to .env.local (see .env.example).`
    );
  }

  return {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  };
}

let cached: { client: AzureOpenAI; deployment: string } | null = null;

/**
 * Return the shared Azure OpenAI client and its deployment name.
 * Throws a descriptive error if configuration is incomplete.
 */
export function getAzureOpenAI(): { client: AzureOpenAI; deployment: string } {
  if (!cached) {
    const config = readConfig();
    cached = {
      client: new AzureOpenAI({
        endpoint: config.endpoint,
        apiKey: config.apiKey,
        apiVersion: config.apiVersion,
        deployment: config.deployment,
      }),
      deployment: config.deployment,
    };
  }

  return cached;
}
