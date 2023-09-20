import { createSignal } from "solid-js";
import createClock from "./zyklus";

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

function getBufferSource(ac, length, fn) {
  const samples = new Float32Array(length);
  for (let i = 0; i < samples.length; i++) {
    samples[i] = fn(i);
  }
  const buffer = ac.createBuffer(1, samples.length, ac.sampleRate);
  buffer.getChannelData(0).set(samples);
  const source = ac.createBufferSource();
  source.buffer = buffer;
  source.connect(ac.destination);
  return source;
}

let ac;
export function BufferChain() {
  const [clock, setClock] = createSignal();
  return (
    <button
      onClick={() => {
        ac = ac || new AudioContext();
        if (!clock()) {
          let phase = 0,
            frequency = 220,
            playhead = 0,
            latency = 0.2;
          const _clock = getClock(ac, () => {
            const source = getBufferSource(
              ac,
              ac.sampleRate * _clock.duration,
              () => {
                const out = Math.sin(phase) / 8;
                frequency += 0.0001;
                phase += (2 * Math.PI * frequency) / ac.sampleRate;
                return out;
              }
            );

            playhead = playhead || ac.currentTime + latency;
            playhead < ac.currentTime && console.log("OH NO...");
            source.start(playhead);
            playhead += source.buffer.duration;
            source.stop(playhead);
          });
          _clock.start();
          setClock(_clock);
        } else {
          clock().stop();
          setClock();
        }
      }}
    >
      {clock() ? "Stop" : "Start"}
    </button>
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
  getBufferSource,
  timesink,
});
