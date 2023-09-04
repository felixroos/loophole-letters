import { createEffect, createSignal } from "solid-js";
import { Waveform } from "../scope/Waveform";

export function playSamples(ac, samples) {
  const buffer = ac.createBuffer(1, samples.length, ac.sampleRate),
    source = ac.createBufferSource();

  buffer.getChannelData(0).set(samples);
  source.buffer = buffer;
  const g = ac.createGain();
  g.gain.value = 0.25;
  source.connect(g);
  g.connect(ac.destination);
  source.start();
  return source;
}

function oscillator(shape, f, sr, t) {
  let s = (t) => t / sr;
  let c = (t) => 2 * Math.PI * s(t, sr);

  const shapes = {
    sine: (f, t) => Math.sin(f * c(t)),
    sawtooth: (f, t) => 1 - 2 * ((f * s(t)) % 1),
    square: (f, t) => Math.sign(1 - 2 * ((f * s(t)) % 1)),
    triangle: (f, t) => 1 - 4 * Math.abs(Math.round(s(t) * f) - s(t) * f),
  };
  return shapes[shape](f, t);
}

function scheduleNote(freq, time, duration, sr, t) {
  return (
    oscillator("triangle", freq, sr, t) *
    linsegs(t / sr, 0, time, 0, 0.01, 1, duration, 1, 0.05, 0)
  );
}

function adsrEnvelope(
  a = 0.001,
  d = 0.001,
  sl = 1,
  st = 0.1,
  r = 0.001,
  t,
  sr
) {
  let lerp = (a, b, n) => n * (b - a) + a;
  let s = t / sr;
  if (s < a) {
    return s / a;
  }
  if (s < a + d) {
    return lerp(1, sl, (s - a) / d);
  }
  if (s < a + d + st) {
    return sl;
  }
  if (s < a + d + st + r) {
    return lerp(sl, 0, (s - a - d - st) / r);
  }
  return 0;
}

// api idea from csound
function linsegs(...args) {
  let t = args[0];
  let v = args[1];
  let a = 2;
  let lerp = (a, b, n) => n * (b - a) + a;
  while (a < args.length) {
    const dur = args[a];
    const next = args[a + 1];
    if (t < dur) {
      return lerp(v, next, t / dur);
    }
    t -= dur;
    v = next;
    a += 2;
  }
  return args[args.length - 1];
}

function fadeInOut(t, fadeTime, duration) {
  return linsegs(t, 0, fadeTime, 1, duration - fadeTime * 2, 1, fadeTime, 0);
}

if (typeof window !== "undefined") {
  Object.assign(window, {
    oscillator,
    adsrEnvelope,
    linsegs,
    scheduleNote,
  });
}

export function BufferPlayer2(props) {
  const [value, setValue] = createSignal(props.value);

  const ac = new AudioContext();

  AudioContext.prototype.generateBuffer = function (fn, seconds) {
    let samples = new Float32Array(this.sampleRate * seconds);
    for (let i = 0; i < samples.length; i++) {
      samples[i] = fn(i);
    }
    const buffer = this.createBuffer(1, samples.length, this.sampleRate);
    buffer.getChannelData(0).set(samples);
    return buffer;
  };

  AudioContext.prototype.playBuffer = function (buffer) {
    const source = this.createBufferSource();
    source.buffer = buffer;
    source.connect(this.destination);
    source.start();
  };

  const buffer = () => {
    const seconds = props.seconds || 0.25;

    let fn = eval(`
    let sampleRate = ${ac.sampleRate};
    let PI2 = Math.PI*2;
    let sin = Math.sin;
  
    let frequency = 220 * PI2/sampleRate;
    let { abs, round, sign, PI, floor, min, max, trunc } = Math; 
    let pi = PI;
    
    (t) => {
      let osc = (wave, f) => oscillator(wave, f, ac.sampleRate, t);
      let adsr = (a,d,sl,st,r) => adsrEnvelope(a,d,sl,st,r,t,ac.sampleRate);
      let linseg = (v,...args) => linsegs(t/ac.sampleRate, v,...args);
      let sine = (f) => osc('sine', f);
      let tri = (f) => osc('triangle', f);
      let saw = (f) => osc('sawtooth', f);
      let note = (f,time,duration) => scheduleNote(f,time,duration,ac.sampleRate,t)
      let square = (f) => osc('square', f);

      let s = t/sampleRate;
      let c = s * Math.PI * 2;
      return ${String(value()).trim()}
    }`);
    if (typeof fn !== "function") {
      throw new Error("expected a function!");
    }
    return ac.generateBuffer(
      (t) => fn(t) * fadeInOut(t / ac.sampleRate, 0.001, seconds),
      seconds
    );
  };

  const run = () => ac.playBuffer(buffer());

  const samples = () => buffer()?.getChannelData(0) || [];

  return (
    <div class="border border-gray-300 p-2 rounded-md bg-blue-100">
      <div class="flex space-x-1 items-center w-full">
        <textarea
          class="grow rounded-md"
          value={value()}
          ref={(el) => {
            el.addEventListener("keypress", (e) => {
              // console.log("e", e);
              if (e.ctrlKey && e.code === "Enter") {
                run();
              }
            });
          }}
          onInput={(e) => setValue(e.target.value)}
          rows={props.rows || 1}
        ></textarea>
        <button
          class="bg-gray-800 text-white rounded-md h-12 px-2"
          onClick={() => run()}
        >
          PLAY
        </button>
      </div>
      <Waveform samples={samples() || []} options={{ scale: 0.25 }} />
    </div>
  );
}
