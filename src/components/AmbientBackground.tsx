import { memo } from "react";

const AmbientBackground = memo(() => {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Grid */}
      <div className="bg-grid-white/[0.02] absolute inset-0"></div>

      {/* Moving Blobs */}
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

      {/* Overlays */}
      <div className="bg-noise absolute inset-0 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
    </div>
  );
});

AmbientBackground.displayName = "AmbientBackground";

export default AmbientBackground;
