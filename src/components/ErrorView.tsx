import { AlertTriangle } from "lucide-react";

interface ErrorViewProps {
  message: string | null;
  onRetry: () => void;
}

const ErrorView = ({ message, onRetry }: ErrorViewProps) => (
  <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-8 bg-black/40 p-8 text-center backdrop-blur-md">
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl"></div>
      <div className="relative rounded-2xl border border-red-500/30 bg-black/50 p-6 text-red-500">
        <AlertTriangle className="mx-auto h-12 w-12 animate-pulse text-red-500" />
      </div>
    </div>

    <div className="space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">System Error</h2>
      <p className="mx-auto max-w-md font-light leading-relaxed text-gray-400">
        {message || "An unknown error occurred."}
      </p>
    </div>

    <button
      onClick={onRetry}
      className="rounded-full bg-white px-8 py-3 font-semibold tracking-wide text-black transition-all hover:scale-105 hover:bg-gray-200"
    >
      Try Again
    </button>
  </div>
);

export default ErrorView;
