"use client";
import {useEffect, useRef, useState} from "react";
import {Play, Square, Volume2, VolumeX} from "lucide-react";
import {SOUNDTRACK, Soundtrack, type SoundStatus} from "./soundtrack";

const LABEL: Record<SoundStatus, string> = {
  loading: "cueing the anthem",
  blocked: "tap play — browsers block sound",
  playing: "now playing",
  paused: "paused",
  stopped: "stopped",
  unavailable: "audio unavailable",
};

/**
 * Sarrainodu soundtrack bridge: starts automatically with the site and lives in the
 * bottom-left corner, where Stop always stays reachable. Because browsers refuse
 * unmuted autoplay without a gesture, a blocked first attempt is retried on the
 * visitor's next click or key press rather than being lost.
 */
export default function SoundBridge({ducked = false}: {ducked?: boolean}) {
  const [status, setStatus] = useState<SoundStatus>("loading");
  const [volume, setVolume] = useState<number>(SOUNDTRACK.volume);
  const engine = useRef<Soundtrack | null>(null);
  const playing = status === "playing";

  useEffect(() => {
    const soundtrack = new Soundtrack();
    engine.current = soundtrack;
    soundtrack.onstatus = setStatus;
    void soundtrack.play();
    return () => {
      engine.current = null;
      soundtrack.onstatus = null;
      soundtrack.dispose();
    };
  }, []);

  // Unlock the moment the page gets its first interaction, then stop listening.
  useEffect(() => {
    if (status !== "blocked") return;
    const unlock = () => void engine.current?.play();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [status]);

  useEffect(() => { engine.current?.setDuck(ducked); }, [ducked]);

  function toggle() {
    const soundtrack = engine.current;
    if (!soundtrack) return;
    if (playing) soundtrack.stop();
    else void soundtrack.play();
  }

  function change(next: number) {
    setVolume(next);
    void engine.current?.setVolume(next / 100);
  }

  const level = Math.round(volume * 100);
  const muted = level === 0;

  return (
    <aside className="sound-bridge" data-status={status} aria-label="Sarrainodu soundtrack">
      <span className="sound-meter" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="sound-copy">
        <b>{SOUNDTRACK.title}</b>
        <small>{LABEL[status]}</small>
      </span>
      <span className="sound-actions">
        <label className="sound-volume" title="Soundtrack volume">
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          <input
            type="range" min={0} max={100} step={1} value={level}
            aria-label="Soundtrack volume"
            onChange={(event) => change(Number(event.currentTarget.value))}
          />
        </label>
        <button type="button" className="sound-stop" onClick={toggle} disabled={status === "loading" || status === "unavailable"} aria-pressed={playing} title={playing ? "Stop the music" : "Play the music"}>
          {playing ? <Square size={11} fill="currentColor" /> : <Play size={11} fill="currentColor" />}
          {playing ? "STOP" : status === "blocked" ? "TAP TO PLAY" : "PLAY"}
        </button>
      </span>
      <p className="sr-only" aria-live="polite">{`Sarrainodu anthem loop — ${LABEL[status]}.`}</p>
    </aside>
  );
}
