"use client";

import { useEffect, useState } from "react";
import Scanner from "@/components/Scanner";
import ProcessingView from "@/components/ProcessingView";
import ResultView from "@/components/ResultView";
import {
  AppState,
  AnalysisResult,
  AnalysisResponse,
  ExtendedWindow,
} from "@/types/types";
import { decode, decodeAudioData } from "@/services/audioUtils";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageSelected = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setSelectedImage(previewUrl);
    setAppState(AppState.ANALYZING);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Analysis failed");
      }

      const data: AnalysisResponse = await response.json();

      // Typed AudioContext creation using ExtendedWindow
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as ExtendedWindow).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 24000 });

      const audioBytes = decode(data.audioBase64);
      const audioBuffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);

      setAnalysisResult({
        landmarkName: data.landmarkName,
        description: data.description,
        groundingSource: data.groundingSource,
        audioBuffer,
      });

      setAppState(AppState.RESULT);
    } catch (err: unknown) {
      let message = "An unexpected error occurred.";
      if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
      setAppState(AppState.ERROR);
    }
  };

  // Cleanup object URL on unmount or image change
  useEffect(() => {
    return () => {
      if (selectedImage?.startsWith("blob:")) {
        URL.revokeObjectURL(selectedImage);
      }
    };
  }, [selectedImage]);

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setSelectedImage(null);
    setAnalysisResult(null);
    setErrorMsg(null);
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ar-dark font-sans text-white selection:bg-ar-primary/30">
      {/* Persistent Ambient Background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Grid */}
        <div className="bg-grid-white/[0.02] absolute inset-0"></div>
        {/* Moving Blobs - Intensified for Glassmorphism */}
        <div className="absolute left-[-10%] top-[-20%] h-[50rem] w-[50rem] animate-blob rounded-full bg-purple-600/30 mix-blend-screen blur-[120px] filter"></div>
        <div
          className="absolute right-[-20%] top-[30%] h-[40rem] w-[40rem] animate-blob rounded-full bg-cyan-500/20 mix-blend-screen blur-[100px] filter"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute bottom-[-20%] left-[10%] h-[45rem] w-[45rem] animate-blob rounded-full bg-blue-600/30 mix-blend-screen blur-[120px] filter"
          style={{ animationDelay: "4s" }}
        ></div>
        <div
          className="absolute left-[40%] top-[40%] h-[30rem] w-[30rem] animate-blob rounded-full bg-pink-600/20 mix-blend-screen blur-[100px] filter"
          style={{ animationDelay: "6s" }}
        ></div>

        {/* Noise Overlay */}
        <div className="bg-noise absolute inset-0 opacity-20"></div>

        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 h-full w-full">
        {appState === AppState.IDLE && (
          <Scanner onImageSelected={handleImageSelected} />
        )}

        {(appState === AppState.ANALYZING ||
          appState === AppState.SEARCHING ||
          appState === AppState.SYNTHESIZING) && (
          <>
            {selectedImage && (
              <div
                className="absolute inset-0 scale-105 bg-cover bg-center opacity-40 blur-sm transition-all duration-1000"
                style={{ backgroundImage: `url(${selectedImage})` }}
              />
            )}
            <ProcessingView state={appState} />
          </>
        )}

        {appState === AppState.RESULT && analysisResult && selectedImage && (
          <ResultView
            result={analysisResult}
            imageSrc={selectedImage}
            onReset={resetApp}
          />
        )}

        {appState === AppState.ERROR && (
          <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-8 bg-black/40 p-8 text-center backdrop-blur-md">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"></div>
              <div className="relative rounded-2xl border border-red-500/30 bg-black/50 p-6 text-red-500">
                <AlertTriangle className="mx-auto h-12 w-12 animate-pulse text-red-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                System Error
              </h2>
              <p className="mx-auto max-w-md font-light leading-relaxed text-gray-400">
                {errorMsg}
              </p>
            </div>

            <button
              onClick={resetApp}
              className="rounded-full bg-white px-8 py-3 font-semibold tracking-wide text-black transition-all hover:scale-105 hover:bg-gray-200"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
