import { createSignal } from "solid-js";
import workletUrl from "./worklet.js?url";

let ac;
export function WasmSynth(props) {
  const [started, setStarted] = createSignal(false);
  let node;
  return (
    <div>
      <pre>{props.code}</pre>
      <button
        onClick={async () => {
          if (started()) {
            node.port.postMessage({ stop: true });
            node.disconnect();
            setStarted(false);
            return;
          }
          ac = ac || new AudioContext();
          await ac.resume();
          await ac.audioWorklet.addModule(workletUrl);
          node = new AudioWorkletNode(ac, "wasm-processor");
          let res = await fetch(props.file); // "./zigsaw/zigsaw.wasm"
          const buffer = await res.arrayBuffer();
          node.port.onmessage = (e) => {
            if (e.data === "OK") {
              console.log("worklet ready");
            }
          };
          node.port.postMessage({ webassembly: buffer });
          node.connect(ac.destination);
          setStarted(true);
        }}
      >
        {!started() ? "play" : "stop"}
      </button>
    </div>
  );
}
