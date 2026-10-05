"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Message } from "@/types/message";

interface Props {
  message: Message;
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function GuestAudioMessageCard({
  message,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(
    message.duration_seconds ?? 0
  );

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    function handlePlay() {
      setPlaying(true);
    }

    function handlePause() {
      setPlaying(false);
    }

    function handleEnded() {
      setPlaying(false);
      setCurrentTime(0);
    }

    function handleTimeUpdate() {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      setCurrentTime(currentAudio.currentTime);
    }

    function handleLoadedMetadata() {
      const currentAudio = audioRef.current;
      if (!currentAudio) return;

      if (Number.isFinite(currentAudio.duration)) {
        setDuration(currentAudio.duration);
      }
    }

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  async function togglePlayback() {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("No fue posible reproducir el audio:", error);
      }
    } else {
      audio.pause();
    }
  }

  function handleSeek(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const audio = audioRef.current;

    if (!audio) return;

    const nextTime = Number(event.target.value);

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  const progress =
    duration > 0
      ? Math.min(100, (currentTime / duration) * 100)
      : 0;

  return (
    <article
      className="
        min-w-0
        snap-start
        rounded-3xl
        border
        border-[#E7DCC8]
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      <audio
        ref={audioRef}
        preload="metadata"
        src={message.public_url ?? undefined}
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#A88249]
            text-white
            shadow-sm
            transition-transform
            duration-200
            hover:scale-105
            hover:bg-[#977640]
            active:scale-95
          "
          aria-label={
            playing
              ? "Pausar mensaje de voz"
              : "Reproducir mensaje de voz"
          }
        >
          {playing ? (
            <Pause size={19} fill="currentColor" />
          ) : (
            <Play
              size={19}
              fill="currentColor"
              className="ml-0.5"
            />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#3F3A34]">
            {message.author_name || "Invitado"}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <Volume2
              size={13}
              className="shrink-0 text-[#A88249]"
            />

            <div className="flex h-4 flex-1 items-end gap-[3px] overflow-hidden">
              {[
                45, 70, 55, 85, 62, 92, 48, 74, 58, 82,
                66, 90, 52, 76, 60, 88, 54, 72, 50, 80,
              ].map((height, index) => (
                <span
                  key={index}
                  className={`
                    w-1 shrink-0 rounded-full
                    transition-all duration-300
                    ${playing
                      ? "bg-[#A88249]"
                      : "bg-[#DCCBAE]"
                    }
                  `}
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </div>

            <span className="shrink-0 text-[11px] tabular-nums text-[#9A9287]">
              {formatTime(
                duration || message.duration_seconds || 0
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <input
          type="range"
          min={0}
          max={Math.max(duration, 1)}
          step={0.1}
          value={Math.min(currentTime, Math.max(duration, 1))}
          onChange={handleSeek}
          aria-label="Progreso del mensaje de voz"
          className="
            h-1.5
            w-full
            cursor-pointer
            appearance-none
            rounded-full
            bg-[#EEE7DC]
            accent-[#A88249]
          "
          style={{
            background: `linear-gradient(
              to right,
              #A88249 0%,
              #A88249 ${progress}%,
              #EEE7DC ${progress}%,
              #EEE7DC 100%
            )`,
          }}
        />

        <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-[#A49B8F]">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration || message.duration_seconds || 0)}</span>
        </div>
      </div>
    </article>
  );
}
