import { useState, useRef, useEffect, useCallback } from "react";
import { ExtendedWindow } from "@/types/types";

export const useAudioPlayer = (audioBuffer: AudioBuffer | null) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (audioBuffer) {
      setDuration(audioBuffer.duration);
    }
    return () => cleanup();
  }, [audioBuffer]);

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        console.warn(e);
        // Ignore errors if already stopped
      }
      sourceRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(() => {
    if (!audioContextRef.current) return;
    const elapsed =
      audioContextRef.current.currentTime -
      startTimeRef.current +
      pauseTimeRef.current;

    setCurrentTime(Math.min(elapsed, duration));

    if (elapsed < duration) {
      rafRef.current = requestAnimationFrame(updateProgress);
    } else {
      setIsPlaying(false);
      setCurrentTime(duration);
      pauseTimeRef.current = 0;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
  }, [duration]);

  const play = useCallback(() => {
    if (!audioBuffer) return;

    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as ExtendedWindow).webkitAudioContext;
      audioContextRef.current = new AudioContextClass({ sampleRate: 24000 });
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);

    const offset = pauseTimeRef.current;
    // Protect against offset being larger than duration
    source.start(0, offset >= duration ? 0 : offset);

    startTimeRef.current = audioContextRef.current.currentTime;
    sourceRef.current = source;

    setIsPlaying(true);
    rafRef.current = requestAnimationFrame(updateProgress);

    source.onended = () => {
      // Logic handled in updateProgress mostly, but strictly ensuring cleanup here
      // is handled by the progress loop check.
    };
  }, [audioBuffer, updateProgress, duration]);

  const pause = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
      } catch (e) {
        console.warn(e);
      }
      sourceRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    if (audioContextRef.current) {
      pauseTimeRef.current +=
        audioContextRef.current.currentTime - startTimeRef.current;
    }
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (currentTime >= duration) {
        pauseTimeRef.current = 0;
        setCurrentTime(0);
      }
      play();
    }
  }, [isPlaying, currentTime, duration, play, pause]);

  return { isPlaying, currentTime, duration, toggle, cleanup };
};
