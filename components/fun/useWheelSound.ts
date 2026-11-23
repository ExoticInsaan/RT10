"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Sounds for the Decision Wheel, made with the Web Audio API (no audio files to load).
 * - a short whoosh when the spin starts
 * - one tick every time a segment edge passes the pointer, timed from the wheel's own easing
 *   curve so the clicks slow down exactly as the wheel does
 * - a small chime when the wheel stops
 * The AudioContext is created inside the Spin click, which browsers require before they allow sound.
 */

type Ctx = AudioContext;

// Same curve as the wheel's CSS transition: cubic-bezier(.12,.72,.12,1).
const X1 = 0.12;
const Y1 = 0.72;
const X2 = 0.12;
const Y2 = 1;

const bez = (u: number, a: number, b: number) => 3 * (1 - u) * (1 - u) * u * a + 3 * (1 - u) * u * u * b + u * u * u;

/** Fraction of the spin time (0..1) at which the wheel has covered `p` (0..1) of its distance. */
function timeAtProgress(p: number) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 28; i++) {
    const mid = (lo + hi) / 2;
    if (bez(mid, Y1, Y2) < p) lo = mid;
    else hi = mid;
  }
  return bez((lo + hi) / 2, X1, X2);
}

function tick(ctx: Ctx, out: AudioNode, at: number, strength: number) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1500 + strength * 500, at);
  osc.frequency.exponentialRampToValueAtTime(700, at + 0.04);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.16 + strength * 0.12, at + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
  osc.connect(g).connect(out);
  osc.start(at);
  osc.stop(at + 0.06);
}

function whoosh(ctx: Ctx, out: AudioNode, at: number) {
  const len = Math.floor(ctx.sampleRate * 0.6);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = 1.2;
  f.frequency.setValueAtTime(300, at);
  f.frequency.exponentialRampToValueAtTime(2600, at + 0.5);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.22, at + 0.12);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.58);
  src.connect(f).connect(g).connect(out);
  src.start(at);
}

function chime(ctx: Ctx, out: AudioNode, at: number) {
  [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => {
    const t = at + i * 0.11;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = hz;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(g).connect(out);
    osc.start(t);
    osc.stop(t + 0.75);
  });
}

export function useWheelSound() {
  const ctxRef = useRef<Ctx | null>(null);
  const outRef = useRef<GainNode | null>(null);

  useEffect(() => {
    return () => {
      const c = ctxRef.current;
      ctxRef.current = null;
      outRef.current = null;
      if (c && c.state !== "closed") void c.close().catch(() => {});
    };
  }, []);

  const ensure = useCallback(() => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") void ctxRef.current.resume().catch(() => {});
      return ctxRef.current;
    }
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      const c = new AC();
      const out = c.createGain();
      out.gain.value = 1;
      out.connect(c.destination);
      ctxRef.current = c;
      outRef.current = out;
      return c;
    } catch {
      return null;
    }
  }, []);

  /**
   * Call from the Spin click. `from` is the wheel's rotation before the spin, `total` how far it turns,
   * `seg` the size of one segment (all in degrees) and `seconds` the spin time.
   */
  const playSpin = useCallback(
    (from: number, total: number, seg: number, seconds: number) => {
      const c = ensure();
      const out = outRef.current;
      if (!c || !out) return;
      const t0 = c.currentTime + 0.03;
      whoosh(c, out, t0);
      // A segment edge reaches the pointer each time the rotation passes a multiple of `seg`.
      const first = Math.floor(from / seg) + 1;
      const last = Math.floor((from + total) / seg);
      for (let k = first; k <= last; k++) {
        const p = (k * seg - from) / total;
        const at = t0 + timeAtProgress(p) * seconds;
        // Early ticks are quick and bright, the last ones are slow and soft.
        tick(c, out, at, 1 - p);
      }
      chime(c, out, t0 + seconds + 0.1);
    },
    [ensure],
  );

  return { playSpin };
}
