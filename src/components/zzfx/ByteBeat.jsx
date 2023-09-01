import { createEffect, createSignal } from "solid-js";
import { Waveform } from "../scope/Waveform";
import { playSamples } from "./BufferPlayer";

const byte2floatBeat = (sample) => (sample & 255) / 127.5 - 1;

export function ByteBeat(props) {
  console.log(props.value);
  const [value, setValue] = createSignal(props.value);

  let src;
  const ac = new AudioContext();
  const samples = () => {
    const fn = `(t) => ${value()}`;
    console.log(fn);
    const byteBeat = eval(fn);
    let srcSampleRate = 5000;
    let dstSampleRate = ac.sampleRate;

    const floatbeat = (i) =>
      byte2floatBeat(byteBeat((i * srcSampleRate) / dstSampleRate));
    const seconds = 20;
    const _samples = Array.from({ length: ac.sampleRate * seconds }, (_, i) => {
      return floatbeat(i);
    });
    return _samples;
  };
  function run() {
    src?.stop();
    src = playSamples(ac, samples());
  }
  return (
    <div>
      <div class="flex space-x-1 items-center w-full">
        <textarea
          class="grow rounded-md"
          value={value()}
          onInput={(e) => setValue(e.target.value)}
          rows={6}
          ref={(el) => {
            el.addEventListener("keypress", (e) => {
              // console.log("e", e);
              if (e.ctrlKey && e.code === "Enter") {
                run();
              }
            });
          }}
        ></textarea>
        <button
          class="bg-gray-800 text-white rounded-md h-12 px-2"
          onClick={async () => {
            run();
          }}
        >
          PLAY
        </button>
      </div>
      <Waveform samples={samples() || []} options={{ scale: 0.25 }} />
    </div>
  );
}
