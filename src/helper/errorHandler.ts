function normalizeAIError(message: string) {
  const m = message.toLowerCase();

  if (
    m.includes("rpc failed") ||
    m.includes("xhr error") ||
    m.includes("proxyunarycall") ||
    m.includes("failed to fetch")
  ) {
    return { code: "AI_CONNECTION", status: 503 };
  }

  if (m.includes("429") || m.includes("rate")) {
    return { code: "AI_RATE_LIMIT", status: 429 };
  }

  if (m.includes("503") || m.includes("overloaded")) {
    return { code: "AI_OVERLOADED", status: 503 };
  }

  if (m.includes("safety") || m.includes("blocked")) {
    return { code: "AI_SAFETY", status: 400 };
  }

  if (m.includes("[0]")) {
    return { code: "AI_UNSUPPORTED_IMAGE", status: 422 };
  }

  return { code: "AI_UNKNOWN", status: 500 };
}

const PUBLIC_ERROR_MESSAGES: Record<string, string> = {
  AI_CONNECTION:
    "We encountered a connection issue with the AI service. Please try again shortly.",
  AI_RATE_LIMIT:
    "The AI service is currently rate limited. Please try again shortly.",
  AI_OVERLOADED:
    "The AI service is currently overloaded. Please try again shortly.",
  AI_SAFETY:
    "This image could not be processed due to safety guidelines. Please try a different photo.",
  AI_UNSUPPORTED_IMAGE:
    "The AI was unable to process this image. It may be unsupported or corrupted.",
  AI_UNKNOWN:
    "The system is temporarily unavailable. Please try again shortly.",
};

export { normalizeAIError, PUBLIC_ERROR_MESSAGES };
