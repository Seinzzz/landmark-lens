import { NextResponse } from "next/server";
import {
  identifyLandmark,
  fetchLandmarkFacts,
  generateTourScript,
  generateTourAudio,
} from "@/services/geminiService";
import { normalizeAIError, PUBLIC_ERROR_MESSAGES } from "@/helper/errorHandler";

export const maxDuration = 60; // Allow longer timeout for chaining models

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fileEntry = formData.get("image");
    if (!(fileEntry instanceof File)) {
      return NextResponse.json({ error: "No image file" }, { status: 400 });
    }

    const file = fileEntry;
    const mimeType = file.type;

    // baca file sebagai array buffer
    const arrayBuffer = await file.arrayBuffer();

    // convert ke base64
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Step 1: Identify
    const landmarkName = await identifyLandmark(base64, mimeType);
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
    // Handle errors gracefully
    const rawMessage = error instanceof Error ? error.message : "Unknown Error";
    const { code, status } = normalizeAIError(rawMessage);
    return NextResponse.json(
      { error: PUBLIC_ERROR_MESSAGES[code] },
      { status },
    );
  }
}
