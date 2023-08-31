import { createSignal } from "solid-js";
import { zzfx, ZZFX as _ZZFX } from "./zzfx";
import { Waveform } from "../scope/Waveform";
import { createEffect } from "solid-js";

export function ZZFX(props) {
  const [samples, setSamples] = createSignal();

  const text = () => `zzfx(${props.params.join(",")})`;
  createEffect(() => {
    if (props.params) {
      const _samples = _ZZFX.buildSamples(...props.params);
      setSamples(_samples);
    }
  });
  return (
    <div>
      <div class="flex space-x-1 items-center">
        <pre>{text()}</pre>
        <button
          class="bg-gray-800 text-white rounded-md h-12 px-2"
          onClick={async () => navigator.clipboard.writeText(text())}
        >
          COPY
        </button>
        <button
          class="bg-gray-800 text-white rounded-md h-12 px-2"
          onClick={async () => zzfx(...props.params)}
        >
          PLAY
        </button>
      </div>
      <Waveform samples={samples()} />
    </div>
  );
}
