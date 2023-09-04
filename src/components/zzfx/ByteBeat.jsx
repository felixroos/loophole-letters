import { createEffect, createSignal } from "solid-js";
import { Waveform } from "../scope/Waveform";
import { playSamples } from "./BufferPlayer";

const byte2floatBeat = (sample) => (sample & 255) / 127.5 - 1;

export function ByteBeat(props) {
  const [value, setValue] = createSignal(props.value);
  const [type, setType] = createSignal(props.type || "bytebeat");
  const [hz, setHz] = createSignal(props.hz || 8000);
  const [length, setLength] = createSignal(props.length || 1);

  let src;
  const ac = new AudioContext();
  const samples = () => {
    const fn = eval(`(t) => ${value()}`);
    let srcSampleRate = hz();
    let dstSampleRate = ac.sampleRate;

    const types = {
      bytebeat: (i) => byte2floatBeat(fn((i * srcSampleRate) / dstSampleRate)),
      floatbeat: (i) => fn((i * srcSampleRate) / dstSampleRate),
    };

    const seconds = length();
    const _samples = Array.from({ length: ac.sampleRate * seconds }, (_, i) => {
      return types[type()](i);
    });
    return _samples;
  };
  function run() {
    src?.stop();
    src = playSamples(ac, samples());
  }
  return (
    <div class="border border-gray-400 p-2 space-y-2 mb-2 rounded-md">
      <div class="flex space-x-2">
        <select onChange={(e) => setType(e.target.value)} value={type()}>
          <option value="bytebeat">bytebeat</option>
          <option value="floatbeat">floatbeat</option>
        </select>
        <label>
          <input
            class="w-32"
            type="number"
            value={hz()}
            onInput={(e) => setHz(e.target.value)}
          />
          Hz
        </label>
        <label>
          <input
            class="w-32"
            type="number"
            value={length()}
            onInput={(e) => setLength(e.target.value)}
          />
          seconds
        </label>
      </div>
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
        <div class="flex flex-col space-y-2">
          <button
            class="bg-gray-800 text-white rounded-md h-12 px-2"
            onClick={async () => {
              run();
            }}
          >
            PLAY
          </button>
          <button
            class="bg-gray-800 text-white rounded-md h-12 px-2"
            onClick={async () => {
              src?.stop();
            }}
          >
            STOP
          </button>
        </div>
      </div>
      <Waveform samples={samples() || []} options={{ scale: 0.25 }} />
    </div>
  );
}
