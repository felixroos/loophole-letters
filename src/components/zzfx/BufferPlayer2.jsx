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
    triangle: (f, t) =>
      1 - 4 * Math.abs(Math.round(s(t) * f) - s(t) * f),
  };
  return shapes[shape](f, t);
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
      let sine = (f) => osc('sine', f);
      let tri = (f) => osc('triangle', f);
      let saw = (f) => osc('sawtooth', f);
      let square = (f) => osc('square', f);
      let s = t/sampleRate;
      let c = s * Math.PI * 2;
      return ${value()}
    }`);
    if (typeof fn !== "function") {
      throw new Error("expected a function!");
    }
    return ac.generateBuffer(fn, seconds);
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
