// import { createSignal } from "solid-js";
import dspModuleUrl from "./synth/dspModule.wasm?url";
import mixerModuleUrl from "./synth/mixerModule.wasm?url";
import dspMeta from "./synth/dspMeta.json";
import { FaustPolyDspGenerator } from "@grame/faustwasm";

export const loadFaustSynth = async (ac) => {
  const [module, mixerModule] = await Promise.all([
    WebAssembly.compileStreaming(fetch(dspModuleUrl)),
    WebAssembly.compileStreaming(fetch(mixerModuleUrl)),
  ]);
  const generator = new FaustPolyDspGenerator();
  const node = await generator.createNode(
    ac,
    16, // voices
    "FaustPolyDSP",
    {
      module,
      json: JSON.stringify(dspMeta),
    },
    mixerModule
  );
  node.connect(ac.destination);
  return node;
};

let ac, synth;

async function play() {
  ac = ac || new AudioContext();
  if (!synth) {
    synth = await loadFaustSynth(ac);
  }
  /* synth.midiMessage(new Uint8Array([144, 56, 114]));
  synth.midiMessage(new Uint8Array([144, 59, 114])); */
  synth.keyOn(1, 56, 110);
  synth.keyOn(2, 59, 110);
  setTimeout(() => {
    synth.keyOff(1, 56, 0);
    synth.keyOff(2, 59, 0);
    /* synth.midiMessage(new Uint8Array([144, 56, 0]));
    synth.midiMessage(new Uint8Array([144, 59, 0])); */
  }, 500);

  /*const midiAccess = await navigator.requestMIDIAccess();
  const currentInput = Array.from(midiAccess.inputs)[0][1];
   currentInput.addEventListener("midimessage", (e) => {
    console.log("midi message", e.data);
    node.midiMessage(e.data);
  }); */
}

const getParams = (faustNode) =>
  Object.fromEntries(
    faustNode.getParams().map((key) => [key, faustNode.getParamValue(key)])
  );

export function FaustSynth() {
  /* ac = ac || new AudioContext();
  const [params, setParams] = createSignal({});

  loadFaustReverb(ac).then((node) => {
    reverb = node;
    setParams(getParams(node));
  }); */
  return (
    <div>
      {" "}
      <div class="flex space-x-2">
        <button
          class="border border-gray-500 p-2 rounded-md hover:bg-blue-200"
          onClick={() => play()}
        >
          play
        </button>
      </div>
      {/* Object.entries(params()).map(([param, value]) => (
        <p>
          {param}: {value}
        </p>
      )) */}
    </div>
  );
}
