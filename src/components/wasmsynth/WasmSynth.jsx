import { createSignal } from "solid-js";
import workletUrl from "./worklet.js?url";
import { Scope } from "../scope/Scope";

export function WasmSynth(props) {
  const ac = new AudioContext();
  const analyser = ac.createAnalyser();
  analyser.fftSize = 2048;

  const [started, setStarted] = createSignal(false);
  let node;
  return (
    <div>
      {props.code && <pre>{props.code}</pre>}
      <button
        class="p-2 bg-indigo-200 rounded-md"
        onClick={async () => {
          if (!started()) {
            await ac.resume();
            await ac.audioWorklet.addModule(workletUrl);
            node = new AudioWorkletNode(ac, "wasm-processor");
            let res = await fetch(props.file);
            const buffer = await res.arrayBuffer();
            node.port.postMessage({ webassembly: buffer });
            node.connect(analyser);
            node.connect(ac.destination);
            setStarted(true);
          } else {
            node.port.postMessage({ stop: true });
            node.disconnect();
            setStarted(false);
            return;
          }
        }}
      >
        {!started() ? "play" : "stop"}
      </button>
      <Scope analyser={analyser} options={{ scale: 0.5 }} />
    </div>
  );
}
