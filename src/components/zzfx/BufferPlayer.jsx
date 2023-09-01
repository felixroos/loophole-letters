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

export function BufferPlayer(props) {
  const [value, setValue] = createSignal(props.value);

  const ac = new AudioContext();

  const samples = () => {
    const seconds = props.seconds || 0.25;
    let fn = eval(`
    let sampleRate = ${ac.sampleRate};
    let PI2 = Math.PI*2;
    let sin = Math.sin;
    let frequency = 220 * PI2/sampleRate;
    let { abs, round, sign } = Math; 

    ${value()}`);
    if (typeof fn !== "function") {
      throw new Error("expected a function!");
    }
    let frequency = 220;
    return Array.from({ length: ac.sampleRate * seconds }, (_, i) => {
      const p = ((Math.PI * 2) / ac.sampleRate) * i;
      return fn({ i, frequency, p, t: p * frequency });
    });
  };

  return (
    <div>
      <div class="flex space-x-1 items-center w-full">
        <textarea
          class="grow rounded-md"
          value={value()}
          onInput={(e) => setValue(e.target.value)}
          rows={6}
        ></textarea>
        <button
          class="bg-gray-800 text-white rounded-md h-12 px-2"
          onClick={async () => {
            playSamples(ac, samples());
          }}
        >
          PLAY
        </button>
      </div>
      <Waveform samples={samples() || []} options={{ scale: 0.25 }} />
    </div>
  );
}
