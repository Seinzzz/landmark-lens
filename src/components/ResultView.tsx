"use client";

import { useEffect, memo } from "react";
import { AnalysisResult } from "@/types/types";
import { ArrowLeft, Pause, Play, Globe, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";

const BackgroundLayer = memo(({ src }: { src: string }) => (
  <div className="absolute inset-0">
    <Image
      src={src}
      alt="Background"
      fill
      className="scale-105 object-cover opacity-60 blur-sm"
      priority
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-[#08090A]/80 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-[0.03]" />
  </div>
));
BackgroundLayer.displayName = "BackgroundLayer";

const TopNavigation = ({ onReset }: { onReset: () => void }) => (
  <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-6">
    <button
      type="button"
      onClick={onReset}
      className="group flex items-center space-x-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-medium backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10"
    >
      <ArrowLeft className="h-4 w-4 text-gray-400 transition-colors group-hover:text-white" />
      <span className="text-gray-300 group-hover:text-white">Scan New</span>
    </button>

    <div className="flex items-center space-x-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
      <span className="font-mono text-[10px] font-bold tracking-widest text-emerald-500">
        ANALYSIS COMPLETE
      </span>
    </div>
  </div>
);

const AudioControls = ({
  isPlaying,
  currentTime,
  duration,
  onToggle,
}: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onToggle: () => void;
}) => (
  <div className="border-b border-white/5 bg-white/[0.02] p-4">
    <div className="flex items-center gap-4">
      <button
        onClick={onToggle}
        className="group relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition-transform hover:bg-gray-200 active:scale-95"
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? (
          <Pause size={20} fill="currentColor" />
        ) : (
          <Play size={20} fill="currentColor" className="ml-1" />
        )}
      </button>

      <div className="flex-grow space-y-2">
        <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
          <span>Audio Guide</span>
          <span className="tabular-nums opacity-70">
            {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
          </span>
        </div>
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-[width] duration-100 ease-linear"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

// --- Markdown Components ---
const markdownComponents = {
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mb-4 font-light leading-relaxed text-gray-300" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <strong className="font-semibold text-white" {...props} />
  ),
  h1: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <h3 className="mb-2 mt-4 text-lg font-medium text-white" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <h4 className="mb-2 mt-4 text-base font-medium text-white" {...props} />
  ),
};

const SourceList = ({
  sources,
}: {
  sources: AnalysisResult["groundingSource"];
}) => {
  if (!sources?.length) return null;

  return (
    <div className="mt-8 border-t border-white/5 pt-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        Sources
      </p>
      <div className="flex flex-wrap gap-2">
        {sources.map((chunk, i) =>
          chunk.web?.uri ? (
            <a
              key={i}
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              <span>{chunk.web.title || new URL(chunk.web.uri).hostname}</span>
              <ExternalLink size={10} className="opacity-50" />
            </a>
          ) : null,
        )}
      </div>
    </div>
  );
};

// --- Main Component ---

interface ResultViewProps {
  result: AnalysisResult;
  imageSrc: string;
  onReset: () => void;
}

const ResultView = ({ result, imageSrc, onReset }: ResultViewProps) => {
  const { isPlaying, currentTime, duration, toggle, cleanup } = useAudioPlayer(
    result.audioBuffer || null,
  );

  // Ensure cleanup when component unmounts explicitly
  useEffect(() => {
    return () => cleanup();
  }, [cleanup]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#08090A] text-white selection:bg-white/20">
      <BackgroundLayer src={imageSrc} />

      <TopNavigation onReset={onReset} />

      {/* Main Content Area */}
      <div className="absolute bottom-0 left-0 right-0 flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-2xl px-6 pb-8 pt-20">
          {/* Title Header */}
          <div className="mb-8 space-y-2">
            <h1 className="bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-sm md:text-5xl lg:text-6xl">
              {result.landmarkName}
            </h1>
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-400">
              <Globe className="h-3 w-3" />
              <span>AI Detected Landmark</span>
            </div>
          </div>

          {/* Content Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xl">
            <AudioControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onToggle={toggle}
            />

            <div className="glass-scroll max-h-[35vh] overflow-y-auto p-6">
              <article className="prose prose-sm prose-invert max-w-none md:prose-base">
                <ReactMarkdown components={markdownComponents}>
                  {result.description}
                </ReactMarkdown>
              </article>

              <SourceList sources={result.groundingSource} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;
