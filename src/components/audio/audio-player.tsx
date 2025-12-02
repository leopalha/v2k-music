"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt?: string;
  previewUrl?: string;
}

interface AudioPlayerProps {
  track: Track;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export function AudioPlayer({
  track,
  onPrevious,
  onNext,
  className,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  // Format time to MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    if (isMuted) {
      audioRef.current.volume = volume || 0.7;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Update time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        setIsPlaying(false);
        onNext?.();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [isRepeat, onNext]);

  // Reset when track changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [track.id]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "bg-bg-secondary border border-border-default rounded-2xl p-4",
        className
      )}
    >
      {/* Hidden audio element */}
      {track.previewUrl && (
        <audio ref={audioRef} src={track.previewUrl} preload="metadata" />
      )}

      <div className="flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Cover */}
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
            {track.coverArt ? (
              <img
                src={track.coverArt}
                alt={track.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Music className="w-6 h-6 text-white/50" />
            )}
          </div>

          {/* Title & Artist */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {track.title}
            </p>
            <p className="text-xs text-text-tertiary truncate">{track.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isShuffle
                  ? "text-primary-400"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={onPrevious}
              disabled={!onPrevious}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!track.previewUrl}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                track.previewUrl
                  ? "bg-white text-black hover:scale-105"
                  : "bg-bg-elevated text-text-tertiary cursor-not-allowed"
              )}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              disabled={!onNext}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isRepeat
                  ? "text-primary-400"
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-text-tertiary font-mono w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-bg-elevated rounded-full cursor-pointer group"
            >
              <div
                className="h-full bg-white rounded-full relative group-hover:bg-primary-400 transition-colors"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <span className="text-xs text-text-tertiary font-mono w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-bg-elevated rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        </div>
      </div>

      {/* No preview message */}
      {!track.previewUrl && (
        <p className="text-xs text-text-tertiary text-center mt-3">
          Preview não disponível para esta música
        </p>
      )}
    </div>
  );
}

// Mini player for bottom bar
export function MiniAudioPlayer({
  track,
  className,
}: {
  track: Track;
  className?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-lg border-t border-border-default p-3 z-50",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-white/50" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {track.title}
            </p>
            <p className="text-xs text-text-tertiary truncate">{track.artist}</p>
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={!track.previewUrl}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            track.previewUrl
              ? "bg-white text-black"
              : "bg-bg-elevated text-text-tertiary cursor-not-allowed"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
}
