"use client";

import { AppState } from "@/types/types";
import Scanner from "@/components/Scanner";
import ProcessingView from "@/components/ProcessingView";
import ResultView from "@/components/ResultView";
import AmbientBackground from "@/components/AmbientBackground"; // Import baru
import ErrorView from "@/components/ErrorView"; // Import baru
import { useHome } from "@/hooks/useHome"; // Import hook

export default function Home() {
  const {
    appState,
    selectedImage,
    analysisResult,
    errorMsg,
    processImage,
    resetApp,
  } = useHome();

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ar-dark font-sans text-white selection:bg-ar-primary/30">
      <AmbientBackground />

      <div className="relative z-10 h-full w-full">
        {/* State 1: IDLE */}
        {appState === AppState.IDLE && (
          <Scanner onImageSelected={processImage} />
        )}

        {/* State 2: PROCESSING (Analyzing, Searching, Synthesizing) */}
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

        {/* State 3: RESULT */}
        {appState === AppState.RESULT && analysisResult && selectedImage && (
          <ResultView
            result={analysisResult}
            imageSrc={selectedImage}
            onReset={resetApp}
          />
        )}

        {/* State 4: ERROR */}
        {appState === AppState.ERROR && (
          <ErrorView message={errorMsg} onRetry={resetApp} />
        )}
      </div>
    </main>
  );
}
