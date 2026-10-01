/**
 * Sarrainodu anthem — the site's automatic soundtrack.
 *
 * The 2016 film recording is owned by Lahari Music, so it cannot be bundled here.
 * Instead the loop is composed and synthesised for this site: an original eight-bar
 * "mass" theme in D Phrygian dominant (dhol, ketti-style lead, brass stabs, crowd)
 * written in the spirit of the film's interval block. No melody or recording from
 * the film is reproduced.
 *
 * Everything is rendered once through an OfflineAudioContext, so playback is a
 * single looping AudioBufferSourceNode: no JS timers to starve in background tabs,
 * and the rendered loop folds its own reverb tail back onto the head (seal below)
 * so the repeat point is seamless.
 *
 * If you hold a licence for the real track, publish it at public/audio/sarrainodu.mp3
 * and the site swaps to it automatically.
 */

export const SOUNDTRACK = {
  /** Optional licensed file that overrides the synthesised loop. */
  file: "/audio/sarrainodu.mp3",
  title: "SARRAINODU",
  credit: "Original anthem loop",
  bpm: 104,
  bars: 8,
  /** Seconds of reverb tail folded back onto the head for a seamless loop. */
  tail: 2.4,
  /** Default loudness of the background loop (0–1). */
  volume: 0.7,
} as const;

const SEMITONE: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, Fb: 4, "E#": 5, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11,
};

/** "Eb4" → frequency in Hz. */
function hz(name: string) {
  const match = /^([A-G][#b]?)(-?\d)$/.exec(name);
  if (!match) return 440;
  return 440 * 2 ** ((SEMITONE[match[1]] + (+match[2] + 1) * 12 - 69) / 12);
}

type Dest = AudioNode;
/** [bar (1-based), step 0–15, note, length in 16th notes] */
type Phrase = [number, number, string, number][];
/** [bar, step, chord notes, length in 16th notes] */
type ChordPhrase = [number, number, string[], number][];

/** One bar of 16 steps: "." rest, "o" soft, "x" hit, "X" accent. */
const BARS = 8;
const KICK = ["x...x..ox...x.o.", "x...x..ox...x.o.", "x.o.x..ox.o.x.o.", "x...x..ox...x.xx", "xXo.xXoxXo.xX.", "xXo.xXoxXo.xX.", "x.......x.......", "x.o.x.o.xXxXxXXx"];
const DHOL = ["..o..o....o.....", "..o..o..o.o..oo.", "..x..o..o.x..ox.", "..o..oo.o.o.oxox", "..x..ox.x.x.xxox", "..x..ox.x.x.xxox", "..o...........o.", "..x..x.xx.xxxxXX"];
const CLAP = ["", "", "....x.......x...", "....x.......x...", "....x.......x...", "....x.......x...", "..........x.....", "....x.....x.x.x."];
const HAT = ["", "", "..x...x...x...x.", "..x...x...x...x.", "..x.o.x...x.o.x.", "..x.o.x.o.x.o.x.", "..x...x...x...x.", "..x.o.x.o.x.x.x."];
const SHAKER = ["", "", "oxoxoxoxoxoxoxox", "oxoxoxoxoxoxoxox", "oxoxoxoxoxoxoxox", "oxoxoxoxoxoxoxox", "o..oo..oo..oo..o", "oxoxoxoxoxoxoxox"];

/** Original 8-bar figure — deliberately not a transcription of any film song. */
const LEAD: Phrase = [
  [5, 0, "A4", 2], [5, 2, "Bb4", 1], [5, 3, "A4", 1], [5, 4, "F#4", 3], [5, 8, "G4", 2], [5, 10, "A4", 1], [5, 11, "G4", 1], [5, 12, "F#4", 4],
  [6, 0, "D5", 2], [6, 2, "C5", 1], [6, 3, "Bb4", 1], [6, 4, "A4", 3], [6, 8, "F#4", 1], [6, 9, "G4", 1], [6, 10, "A4", 2], [6, 12, "G4", 4],
  [8, 0, "D5", 1], [8, 1, "Eb5", 1], [8, 2, "D5", 2], [8, 4, "A4", 2], [8, 6, "Bb4", 2], [8, 8, "A4", 2], [8, 10, "F#4", 2], [8, 12, "D5", 4],
];
const BASS: Phrase = [
  [3, 0, "D2", 4], [3, 6, "D2", 2], [3, 8, "D2", 3], [3, 12, "A1", 4],
  [4, 0, "D2", 3], [4, 4, "D2", 3], [4, 8, "Eb2", 3], [4, 12, "D2", 4],
  [5, 0, "D2", 4], [5, 4, "A1", 2], [5, 8, "D2", 4], [5, 12, "C2", 4],
  [6, 0, "Bb1", 4], [6, 8, "C2", 4], [6, 12, "A1", 4],
  [7, 0, "D2", 8], [7, 8, "Bb1", 8],
  [8, 0, "A1", 4], [8, 8, "A1", 2], [8, 10, "Bb1", 2], [8, 12, "Eb2", 2],
];
const BRASS: ChordPhrase = [
  [2, 12, ["D4", "F#4", "A4"], 4],
  [4, 0, ["D4", "A4"], 3], [4, 4, ["Eb4", "Bb4"], 3], [4, 8, ["D4", "F#4", "A4"], 6],
  [6, 0, ["A4", "C5", "E5"], 3], [6, 4, ["Bb4", "D5"], 3], [6, 12, ["A4", "Eb5"], 4],
  [8, 0, ["D4", "A4"], 2], [8, 2, ["D4", "Bb4"], 2], [8, 4, ["D4", "C5"], 2], [8, 6, ["Eb4", "C5"], 2], [8, 8, ["D4", "A4", "D5"], 8],
];
const PAD: ChordPhrase = [
  [1, 0, ["D3", "A3", "F#4", "D4"], 30],
  [7, 0, ["D3", "A3", "F#4", "C4"], 15], [7, 8, ["Bb2", "F4", "D4"], 15],
];
/** Ghungroo bells and crowd shouts that sit on top of the drop. */
const SPARK: Phrase = [
  [5, 6, "D6", 1], [5, 14, "A5", 1], [6, 6, "D6", 1], [6, 14, "C6", 1],
  [7, 0, "A5", 2], [7, 8, "D6", 2], [8, 12, "D6", 1], [8, 13, "E6", 1], [8, 14, "A6", 1],
];
const SHOUT: [number, number, number][] = [[4, 14, 1], [6, 0, 1.2], [6, 8, 1], [8, 4, 1.4], [8, 12, 1.6]];

const MARK: Record<string, number> = { o: 0.45, x: 0.8, X: 1 };

/** Renders the anthem and returns a seamless, peak-normalised looping buffer. */
export async function renderAnthem(sampleRate = 44100): Promise<AudioBuffer> {
  const step = 60 / SOUNDTRACK.bpm / 4;
  const grooveSeconds = BARS * 4 * 4 * step;
  const tail = SOUNDTRACK.tail;
  const Offline = globalThis.OfflineAudioContext;
  if (!Offline) throw new Error("OfflineAudioContext is unavailable");
  const ctx = new Offline({ numberOfChannels: 2, length: Math.ceil((grooveSeconds + tail) * sampleRate), sampleRate });

  const master = ctx.createGain(); master.gain.value = 0.85;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -13; compressor.knee.value = 24; compressor.ratio.value = 3.4;
  compressor.attack.value = 0.006; compressor.release.value = 0.19;
  const body = ctx.createBiquadFilter(); body.type = "peaking"; body.frequency.value = 3200; body.Q.value = 0.8; body.gain.value = 2.5;
  master.connect(compressor).connect(body).connect(ctx.destination);

  const reverb = ctx.createGain(); reverb.gain.value = 0.9;
  const convolver = ctx.createConvolver(); convolver.buffer = impulse(ctx, tail);
  reverb.connect(convolver).connect(master);
  const echo = ctx.createGain(); echo.gain.value = 0.55;
  const slap = ctx.createDelay(1); slap.delayTime.value = step * 3;
  const feedback = ctx.createGain(); feedback.gain.value = 0.26;
  const darken = ctx.createBiquadFilter(); darken.type = "lowpass"; darken.frequency.value = 3000;
  const slapOut = ctx.createGain(); slapOut.gain.value = 0.8;
  echo.connect(slap).connect(darken).connect(slapOut).connect(master);
  darken.connect(feedback).connect(slap);

  const bus = (level: number, send: number) => {
    const g = ctx.createGain(); g.gain.value = level; g.connect(master);
    if (send) { const s = ctx.createGain(); s.gain.value = send; s.connect(reverb); s.connect(echo); }
    return g;
  };
  const drums = bus(0.95, 0.05), low = bus(0.8, 0.02), mid = bus(0.5, 0.18), horn = bus(0.44, 0.32), air = bus(0.3, 0.5);

  const noise = ctx.createBuffer(1, Math.max(1, Math.floor(sampleRate * 2)), sampleRate);
  const grain = noise.getChannelData(0);
  for (let i = 0; i < grain.length; i++) grain[i] = Math.random() * 2 - 1;
  const curve = new Float32Array(1025);
  for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh(((i / 512) - 1) * 1.9) / Math.tanh(1.9);

  const at = (bar: number, index: number) => (bar - 1) * 16 * step + index * step;
  const swing = (index: number) => (index % 2 ? 0.03 : 0) * step;
  /** Routes a node to its bus, optionally widening it across the stereo field. */
  const to = (node: AudioNode, dest: Dest, pan = 0) => {
    if (!pan || !ctx.createStereoPanner) { node.connect(dest); return; }
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    node.connect(panner).connect(dest);
  };

  function envelope(g: GainNode, t: number, attack: number, dur: number, peak: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(attack + 0.02, dur));
    g.gain.setValueAtTime(0, t + Math.max(attack + 0.02, dur) + 0.004);
  }
  /** Filtered noise one-shot (claps, hats, shakers, rolls). */
  function burst(t: number, dur: number, type: BiquadFilterType, freq: number, q: number, peak: number, dest: Dest, pan = 0) {
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true;
    src.playbackRate.value = 0.85 + Math.random() * 0.3;
    const filter = ctx.createBiquadFilter(); filter.type = type; filter.frequency.value = freq; filter.Q.value = q;
    const g = ctx.createGain(); envelope(g, t, 0.003, dur, peak);
    src.connect(filter).connect(g); to(g, dest, pan); src.start(t); src.stop(t + dur + 0.06);
  }
  /** Enveloped oscillator; the caller routes the returned node. */
  function voice(t: number, type: OscillatorType, freq: number, dur: number, peak: number, attack = 0.01, glide = 0, detune = 0) {
    const osc = ctx.createOscillator(); osc.type = type; osc.detune.value = detune;
    if (glide) { osc.frequency.setValueAtTime(freq * glide, t); osc.frequency.exponentialRampToValueAtTime(freq, t + 0.09); }
    else osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain(); envelope(g, t, attack, dur, peak);
    osc.connect(g); osc.start(t); osc.stop(t + Math.max(0.12, dur) + 0.12);
    return g;
  }
  function kick(t: number, v: number) {
    const osc = ctx.createOscillator(); osc.type = "sine";
    osc.frequency.setValueAtTime(60 + 165 * v, t);
    osc.frequency.exponentialRampToValueAtTime(44, t + 0.11);
    const g = ctx.createGain(); envelope(g, t, 0.004, 0.3, 1.05 * v);
    osc.connect(g).connect(drums); osc.start(t); osc.stop(t + 0.38);
    burst(t, 0.02, "highpass", 1400, 0.7, 0.3 * v, drums);
  }
  function dhol(t: number, v: number, pan = 0) {
    const osc = ctx.createOscillator(); osc.type = "triangle";
    osc.frequency.setValueAtTime(195, t); osc.frequency.exponentialRampToValueAtTime(76, t + 0.14);
    const g = ctx.createGain(); envelope(g, t, 0.005, 0.24, 0.8 * v);
    to(g, drums, pan); osc.start(t); osc.stop(t + 0.32);
    burst(t, 0.075, "bandpass", 780, 1.1, 0.42 * v, drums, pan * 1.4);
  }
  /** Metallic ghungroo ping built from inharmonic partials. */
  function bell(t: number, freq: number, v: number, pan = 0) {
    const g = ctx.createGain(); g.gain.value = v;
    const filter = ctx.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = 900;
    filter.connect(g); to(g, air, pan);
    [1, 2.76, 5.4].forEach((partial, index) => voice(t, "sine", freq * partial, 0.5 / (index + 1), 0.4 / (index + 1), 0.002).connect(filter));
  }
  /** Crowd shout, approximated by a swept formant on noise. */
  function shout(t: number, v: number, pan = 0) {
    const g = ctx.createGain(); envelope(g, t, 0.03, 0.34, 0.5 * v);
    const formant = ctx.createBiquadFilter(); formant.type = "bandpass"; formant.frequency.value = 760; formant.Q.value = 3.2;
    formant.frequency.setValueAtTime(760, t); formant.frequency.exponentialRampToValueAtTime(1180, t + 0.2);
    const src = ctx.createBufferSource(); src.buffer = noise; src.playbackRate.value = 0.6;
    src.connect(formant).connect(g); to(g, air, pan); src.start(t); src.stop(t + 0.45);
  }

  for (let bar = 1; bar <= BARS; bar++) {
    const grid: [string[], (t: number, v: number, i: number) => void][] = [
      [KICK, (t, v) => kick(t, v)],
      [DHOL, (t, v, i) => dhol(t, v, i % 4 === 2 ? 0.22 : -0.2)],
      [CLAP, (t, v) => { burst(t, 0.11, "bandpass", 1750, 1.1, 0.5 * v, drums, -0.1); burst(t + 0.012, 0.09, "bandpass", 2450, 0.9, 0.36 * v, drums, 0.12); }],
      [HAT, (t, v, i) => burst(t, v > 0.7 ? 0.06 : 0.03, "highpass", 7400, 0.8, 0.22 * v, drums, i % 2 ? 0.3 : -0.24)],
      [SHAKER, (t, v, i) => burst(t, 0.045, "bandpass", 5200, 1.6, 0.05 + 0.14 * v, drums, i % 4 === 2 ? 0.45 : -0.4)],
    ];
    for (const [pattern, hit] of grid) {
      const marks = pattern[bar - 1] ?? "";
      for (let i = 0; i < 16; i++) {
        const v = MARK[marks[i]];
        if (v) hit(at(bar, i) + swing(i), v, i);
      }
    }
    // Snare roll into the drop and out of the break.
    if (bar === 4 || bar === BARS) for (let i = 12; i < 16; i++) burst(at(bar, i), 0.05, "bandpass", 2100, 1, 0.15 + (i - 12) * 0.13, drums, (i % 2 ? 0.35 : -0.35));
  }

  for (const [bar, i, note, length] of BASS) {
    const t = at(bar, i), dur = length * step;
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.Q.value = 5.5;
    filter.frequency.setValueAtTime(760, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + dur * 0.85);
    const g = ctx.createGain(); envelope(g, t, 0.014, dur * 0.95, 0.8);
    // The sub stays dead centre; only the saw layer leans out a touch.
    to(voice(t, "sawtooth", hz(note), dur, 0.9, 0.014, 1.03), filter, 0.14);
    voice(t, "sine", hz(note) / 2, dur, 0.7, 0.02).connect(filter);
    filter.connect(g).connect(low);
  }

  for (const [bar, i, chord, length] of BRASS) {
    const t = at(bar, i), dur = length * step;
    const g = ctx.createGain(); envelope(g, t, 0.035, dur, 0.3);
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.Q.value = 1.4;
    filter.frequency.setValueAtTime(650, t);
    filter.frequency.exponentialRampToValueAtTime(4200, t + 0.07);
    filter.frequency.exponentialRampToValueAtTime(1400, t + Math.max(0.1, dur));
    filter.connect(g).connect(mid);
    chord.forEach((note, index) => {
      // Three detuned layers per chord voice, fanned out, read as one section.
      for (const [spread, pan] of [[-9, -0.4], [0, 0], [9, 0.4]] as [number, number][]) {
        to(voice(t, index % 2 ? "sawtooth" : "square", hz(note), dur, 0.34 / chord.length, 0.035, 0, spread), filter, pan);
      }
    });
  }

  for (const [bar, i, note, length] of LEAD) {
    const t = at(bar, i), dur = length * step, freq = hz(note);
    const g = ctx.createGain(); envelope(g, t, 0.05, dur * 1.05, 0.45);
    g.connect(horn);
    // Two detuned reed tracks, opened left and right, give the lead its hall width.
    for (const [pan, cents] of [[-0.2, -6], [0.2, 7]] as [number, number][]) {
      const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = freq * 2.4; band.Q.value = 1.1;
      const reed = ctx.createWaveShaper(); reed.curve = curve;
      band.connect(reed); to(reed, g, pan);
      const saw = ctx.createOscillator(); saw.type = "sawtooth"; saw.detune.value = cents;
      saw.frequency.setValueAtTime(freq * 1.05, t); saw.frequency.exponentialRampToValueAtTime(freq, t + 0.09);
      const octave = ctx.createOscillator(); octave.type = "sine";
      octave.frequency.setValueAtTime(freq * 2, t);
      const sawGain = ctx.createGain(); sawGain.gain.value = 0.8;
      const octaveGain = ctx.createGain(); octaveGain.gain.value = 0.28;
      saw.connect(sawGain).connect(band); octave.connect(octaveGain).connect(band);
      const vibrato = ctx.createOscillator(); vibrato.frequency.value = 5.4 + Math.random() * 0.5;
      const depth = ctx.createGain(); depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(12, t + 0.18);
      vibrato.connect(depth); depth.connect(saw.detune); depth.connect(octave.detune);
      const end = t + Math.max(0.12, dur * 1.05) + 0.12;
      for (const node of [saw, octave, vibrato]) { node.start(t); node.stop(end); }
    }
  }

  for (const [bar, i, chord, length] of PAD) {
    const t = at(bar, i), dur = length * step;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.32, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = 1500;
    filter.connect(g).connect(air);
    chord.forEach((note, index) => {
      const drone = ctx.createOscillator(); drone.type = "sine";
      drone.frequency.value = hz(note); drone.detune.value = Math.random() * 8 - 4;
      const partial = ctx.createGain(); partial.gain.value = 0.3;
      drone.connect(partial); to(partial, filter, index % 2 ? 0.55 : -0.5);
      drone.start(t); drone.stop(t + dur + 0.3);
    });
  }

  SPARK.forEach(([bar, i, note], index) => bell(at(bar, i), hz(note), bar === BARS ? 0.32 : 0.22, index % 2 ? 0.6 : -0.55));
  SHOUT.forEach(([bar, i, v], index) => shout(at(bar, i), v, index % 2 ? 0.35 : -0.3));

  // Crowd bed under the drop: two decorrelated noise tracks, wide apart.
  const crowd = ctx.createGain(); crowd.gain.value = 0.05;
  const swell = ctx.createOscillator(); swell.frequency.value = 0.13;
  const swellDepth = ctx.createGain(); swellDepth.gain.value = 0.03;
  swell.connect(swellDepth).connect(crowd.gain);
  for (const [pan, rate] of [[-0.62, 0.4], [0.62, 0.47]] as [number, number][]) {
    const band = ctx.createBiquadFilter(); band.type = "bandpass"; band.frequency.value = 950; band.Q.value = 0.7;
    const src = ctx.createBufferSource(); src.buffer = noise; src.loop = true; src.playbackRate.value = rate;
    src.connect(band).connect(crowd); to(crowd, air, pan);
    src.start(at(3, 0)); src.stop(at(BARS, 16));
  }
  swell.start(0); swell.stop(grooveSeconds + tail);

    return seal(await ctx.startRendering(), Math.ceil(grooveSeconds * sampleRate), ctx);
}

/** Folds the reverb tail onto the head for a click-free repeat point, then normalises. */
function seal(rendered: AudioBuffer, frames: number, ctx: BaseAudioContext): AudioBuffer {
  const channels = Math.min(rendered.numberOfChannels, ctx.destination.channelCount) || 1;
  const out = ctx.createBuffer(channels, frames, rendered.sampleRate);
  let peak = 0;
  for (let channel = 0; channel < channels; channel++) {
    const source = rendered.getChannelData(channel), target = out.getChannelData(channel);
    for (let i = 0; i < frames; i++) {
      const tail = rendered.length > frames + i ? source[frames + i] * 0.85 : 0;
      target[i] = source[i] + tail;
      const level = Math.abs(target[i]);
      if (level > peak) peak = level;
    }
  }
  const gain = peak > 0.001 ? 0.94 / peak : 1;
  for (let channel = 0; channel < channels; channel++) {
    const data = out.getChannelData(channel);
    for (let i = 0; i < frames; i++) data[i] *= gain;
  }
  return out;
}

function impulse(ctx: BaseAudioContext, seconds: number) {
  const rate = ctx.sampleRate, length = Math.max(1, Math.floor(seconds * rate));
  const ir = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = ir.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      const decay = (1 - i / length) ** 2.9;
      data[i] = (Math.random() * 2 - 1) * decay * (i < rate * 0.012 ? i / (rate * 0.012) : 1);
    }
  }
  return ir;
}

export type SoundStatus = "loading" | "blocked" | "playing" | "paused" | "stopped" | "unavailable";

/**
 * Owns playback. A licensed /audio/sarrainodu.mp3 wins when published, otherwise the
 * synthesised loop runs. Browser autoplay rules are handled by reporting "blocked"
 * so the UI can ask for exactly one tap.
 */
export class Soundtrack {
  private ctx: AudioContext | null = null;
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private element: HTMLAudioElement | null = null;
  private disposed = false;
  mode: "file" | "synth" = "synth";
  volume: number = SOUNDTRACK.volume;
  private ducked = false;
  onstatus: ((status: SoundStatus) => void) | null = null;

  private report(status: SoundStatus) { if (!this.disposed) this.onstatus?.(status); }

  /** Builds the graph (and renders the loop) without starting audio. */
  prepare() { return this.task ??= this.build(); }

  private task: Promise<void> | null = null;

  private async build() {
    if (this.ctx || this.element) return;
    this.report("loading");
    if (await this.licensedFileExists()) {
      this.mode = "file";
      this.element = new Audio(SOUNDTRACK.file);
      this.element.loop = true;
      this.element.volume = this.target();
      return;
    }
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) { this.report("unavailable"); return; }
    // Created before rendering so the loop matches the live context's sample rate.
    this.ctx = new AudioCtor();
    try {
      this.buffer = await renderAnthem(this.ctx.sampleRate);
    } catch {
      this.report("unavailable");
      return;
    }
    if (this.disposed || !this.buffer) return;
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0.0001;
    this.gain.connect(this.ctx.destination);
  }

  /** The site swaps to /audio/sarrainodu.mp3 whenever such a file is published. */
  private async licensedFileExists(): Promise<boolean> {
    try {
      const response = await fetch(SOUNDTRACK.file, { method: "HEAD", cache: "no-store" });
      if (!response.ok) return false;
      const type = response.headers.get("content-type") ?? "";
      // A dev/SPA server answers 404s with HTML; that is not a track.
      return !/text\/html/i.test(type);
    } catch { return false; }
  }

  private target() { return this.volume * (this.ducked ? 0.25 : 1); }

  /** Starts playback; returns false while the browser still demands a gesture. */
  async play(): Promise<boolean> {
    if (this.disposed) return false;
    await this.prepare();
    if (this.mode === "file" && this.element) {
      this.element.volume = this.target();
      try { await this.element.play(); this.report("playing"); return true; }
      catch { const blocked = this.element.paused; this.report(blocked ? "blocked" : "playing"); return !blocked; }
    }
    const ctx = this.ctx;
    if (!ctx || !this.gain || !this.buffer) { this.report("unavailable"); return false; }
    if (ctx.state === "suspended") {
      try { await ctx.resume(); } catch { /* state check below decides */ }
    }
    if (ctx.state !== "running") { this.report("blocked"); return false; }
    if (!this.source) {
      const source = ctx.createBufferSource();
      source.buffer = this.buffer;
      source.loop = true;
      source.connect(this.gain);
      source.start();
      this.source = source;
    }
    this.ramp(this.target(), 0.9);
    this.report("playing");
    return true;
  }

  /** Stop button: fades out, releases the graph, and stays off until replayed. */
  stop(fade = 0.35) {
    if (this.mode === "file") {
      if (this.element) { this.element.pause(); this.element.currentTime = 0; }
      this.report("stopped"); return;
    }
    if (this.ctx && this.gain) this.ramp(0, fade);
    const released = this.source;
    this.source = null;
    if (released) window.setTimeout(() => { try { released.stop(); } catch { /* finished */ } released.disconnect(); }, fade * 1000 + 90);
    this.report("stopped");
  }

  pause() {
    if (this.mode === "file") this.element?.pause();
    else void this.ctx?.suspend();
    this.report("paused");
  }

  async setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.element) this.element.volume = this.target();
    if (this.ctx && this.gain && this.source) this.ramp(this.target(), 0.12);
  }

  /** Lowers the music while the navigation sheet or a trailer dialog is open. */
  setDuck(ducked: boolean) {
    if (this.ducked === ducked) return;
    this.ducked = ducked;
    if (this.element) this.element.volume = this.target();
    if (this.ctx && this.gain && this.source) this.ramp(this.target(), 0.15);
  }

  private ramp(value: number, seconds: number) {
    if (!this.ctx || !this.gain) return;
    const now = this.ctx.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(Math.max(0.0001, this.gain.gain.value), now);
    this.gain.gain.linearRampToValueAtTime(Math.max(0.0001, value), now + seconds);
  }

  dispose() {
    this.disposed = true;
    this.onstatus = null;
    try { this.source?.stop(); } catch { /* not started */ }
    this.source?.disconnect();
    this.element?.pause();
    const ctx = this.ctx;
    this.ctx = null; this.gain = null; this.source = null; this.element = null; this.buffer = null;
    void ctx?.close();
  }
}
