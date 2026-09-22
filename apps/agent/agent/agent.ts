import { defineAgent } from "eve";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export default defineAgent({
  model: openrouter("deepseek/deepseek-v4.1-flash"),
  // eve can't look up context window size for a direct-provider model (only
  // AI Gateway model ids have known metadata) — DeepSeek V4.1 Flash's real
  // context window, per OpenRouter's model page.
  modelContextWindowTokens: 1_048_576,
});
