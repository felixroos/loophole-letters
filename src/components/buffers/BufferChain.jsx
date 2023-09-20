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
  let t = 0,
    playhead;
  const interval = 0.1;
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
      playhead = playhead || ac.currentTime;
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
  const [value, setValue] = createSignal(props.value || "Math.sin(t / 20)");
  const [clock, setClock] = createSignal();
  const [samples, setSamples] = createSignal([]);
  const [fn, setFn] = createSignal(() => getFn());
  const getFn = () => eval(`(t) => ${value()}`);
  let ac;
  const update = () => setFn(() => getFn());
  update();
  const stop = () => {
    clock()?.stop();
    setClock();
  };
  const start = () => {
    stop();
    let t = 0;
    ac = ac || new AudioContext();
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
