import { NextResponse } from "next/server";
import {
  identifyLandmark,
  fetchLandmarkFacts,
  generateTourScript,
  generateTourAudio,
} from "@/services/geminiService";

export const maxDuration = 60; // Allow longer timeout for chaining models

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image data missing" },
        { status: 400 },
      );
    }

    // Step 1: Identify
    const landmarkName = await identifyLandmark(image, mimeType);
    if (landmarkName === "Unknown") {
      return NextResponse.json(
        {
          error:
            "We couldn't identify a landmark in this photo. Please try a clearer shot of a building, monument, or famous site.",
        },
        { status: 422 },
      );
    }

    // Step 2: Details
    const { text: facts, chunks } = await fetchLandmarkFacts(landmarkName);

    const description = await generateTourScript(landmarkName, facts);

    // Step 3: TTS
    const audioBase64 = await generateTourAudio(description);

    return NextResponse.json({
      landmarkName,
      description,
      groundingSource: chunks,
      audioBase64,
    });
  } catch (error: unknown) {
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Sanitize raw Google RPC/XHR errors
    if (
      errorMessage.includes("Rpc failed") ||
      errorMessage.includes("xhr error") ||
      errorMessage.includes("ProxyUnaryCall") ||
      errorMessage.includes("failed to fetch") ||
      errorMessage.includes("404")
    ) {
      errorMessage =
        "We encountered a connection issue with the AI service. Please try again shortly.";
    } else if (
      errorMessage.includes("503") ||
      errorMessage.includes("Overloaded")
    ) {
      errorMessage =
        "The AI system is currently experiencing high traffic. Please try again in a few moments.";
    } else if (
      errorMessage.includes("SAFETY") ||
      errorMessage.includes("blocked")
    ) {
      errorMessage =
        "This image could not be processed due to safety guidelines. Please try a different photo.";
    } else if (errorMessage.includes("[0]")) {
      // Catch-all for the specific array error in the prompt
      errorMessage =
        "The AI was unable to process this specific image. It may be unsupported or corrupted.";
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
