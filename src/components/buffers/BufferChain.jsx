import { createSignal } from "solid-js";
import createClock from "./zyklus";
import { Waveform } from "../scope/Waveform";
import { cs } from "date-fns/locale";

function getClock(ac, fn, interval) {
  const getTime = () => ac.currentTime;
  const clock = createClock(
    getTime,
    // called slightly before each cycle
    fn,
    interval // duration of each cycle
  );
  return clock;
}

function bufferclock(ac, fn) {
  let playhead,
    latency = 0.1;
  const interval = 0.02;
  const nSamples = interval * ac.sampleRate;
  const buffer = ac.createBuffer(1, nSamples, ac.sampleRate);
  const samples = new Float32Array(nSamples);

  const clock = getClock(
    ac,
    () => {
      for (let i = 0; i < samples.length; i++) {
        samples[i] = fn(i); // call fn on each sample
      }
      buffer.getChannelData(0).set(samples);
      // play buffer
      const source = ac.createBufferSource();
      source.buffer = buffer;
      source.connect(ac.destination);
      playhead = playhead || ac.currentTime + latency;
      playhead < ac.currentTime && console.log("OH NO...");
      source.start(playhead);
      playhead += source.buffer.duration;
      source.stop(playhead);
    },
    interval
  );
  return clock;
}

export function BufferChain(props) {
  const [value, setValue] = createSignal(props.value);
  const [clock, setClock] = createSignal();
  const [samples, setSamples] = createSignal([]);
  const [fn, setFn] = createSignal(() => getFn());
  const getFn = (ac) =>
    eval(`let sampleRate = ${ac.sampleRate};
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
  let ac;
  const update = () => setFn(() => getFn(ac));
  const stop = () => {
    clock()?.stop();
    setClock();
  };
  const start = () => {
    ac = ac || new AudioContext();
    update();
    stop();
    let t = 0;
    const _clock = bufferclock(ac, () => fn()(++t));
    _clock.start();
    setClock(_clock);
  };
  const toggle = () => {
    if (clock()) {
      stop();
    } else {
      start();
    }
  };
  return (
    <div class="flex">
      <textarea
        rows={props.rows || 1}
        class="grow rounded-md"
        value={value()}
        ref={(el) => {
          el.addEventListener("click", function handleClick() {
            ac = ac || new AudioContext();
            el.removeEventListener("click", handleClick);
          });
          el.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.code === "Enter") {
              update();
              start();
            } else if (e.ctrlKey && e.key === ".") {
              stop();
            }
          });
        }}
        onInput={(e) => setValue(e.target.value)}
        rows={props.rows || 1}
      ></textarea>
      {/* <Waveform samples={samples() || []} options={{ scale: 0.25 }} /> */}
      <button onClick={() => toggle()}>{clock() ? "Stop" : "Start"}</button>
    </div>
  );
}

function timesink(fn, duration = 1000) {
  let block = 0;
  function sink() {
    fn(block++) && setTimeout(sink, duration);
  }
  sink();
}

Object.assign(globalThis, {
  getClock,
  bufferclock,
  timesink,
});
