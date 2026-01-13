import { useState, useEffect, useCallback } from "react";
import {
  AppState,
  AnalysisResult,
  AnalysisResponse,
  ExtendedWindow,
} from "@/types/types";
import { decode, decodeAudioData } from "@/services/audioUtils";

export const useHome = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cleanup object URL untuk mencegah memory leak
  useEffect(() => {
    return () => {
      if (selectedImage?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const processImage = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      // 1. Prepare Data
      const formData = new FormData();
      formData.append("image", file);

      // 2. Call API
      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data: AnalysisResponse = await response.json();

      // 3. Process Audio (Client Side)
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as ExtendedWindow).webkitAudioContext;

      // Note: We create context just for decoding here.
      // ResultView will likely handle playback context separately or reuse logic.
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });
      const audioBytes = decode(data.audioBase64);
      const audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);

      // 4. Update State Success
      setAnalysisResult({
        landmarkName: data.landmarkName,
        description: data.description,
        groundingSource: data.groundingSource,
        audioBuffer,
      });

      setAppState(AppState.RESULT);

      // Close decoding context to free resources
      if (audioCtx.state !== "closed") {
        audioCtx.close();
      }
    } catch (err: unknown) {
      console.error("Processing error:", err);
      let message = "An unexpected error occurred.";
      if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
      setAppState(AppState.ERROR);
    }
  }, []);

  const resetApp = useCallback(() => {
    setAppState(AppState.IDLE);
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  }, []);

  return {
    appState,
    selectedImage,
    analysisResult,
    errorMsg,
    processImage,
    resetApp,
  };
};
