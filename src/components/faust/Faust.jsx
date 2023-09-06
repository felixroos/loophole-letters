import dspModuleUrl from "./reverb/dspModule.wasm?url";
import dspMeta from "./reverb/dspMeta.json";
import { FaustMonoDspGenerator } from "@grame/faustwasm";

let clapBuffer;
async function getClapBuffer(ac) {
  const load = async () => {
    // create buffer source from a test sample
    const res = await fetch(
      "https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/cp/HANDCLP0.wav"
    );
    const buffer = await res.arrayBuffer();
    const audioBuffer = await ac.decodeAudioData(buffer);
    return audioBuffer;
  };
  if (!clapBuffer) {
    clapBuffer = load();
  }
  return clapBuffer;
}

let audioContext;
const getAudioContext = () => audioContext || new AudioContext();

async function dry() {
  const ac = new AudioContext();
  const source = ac.createBufferSource();
  source.buffer = await getClapBuffer(ac);
  source.connect(ac.destination);
  source.start();
}

async function wet() {
  const ac = getAudioContext();

  // init faustNode
  const module = await WebAssembly.compileStreaming(fetch(dspModuleUrl));
  const generator = new FaustMonoDspGenerator();
  const faustNode = await generator.createNode(ac, "FaustMonoDSP", {
    module,
    json: JSON.stringify(dspMeta),
  });

  const source = ac.createBufferSource();
  source.buffer = await getClapBuffer(ac);

  // connect it together and play
  source.connect(faustNode);
  faustNode.connect(ac.destination);
  source.start();
}

export function FaustReverb() {
  return (
    <div class="flex space-x-2">
      <button onClick={() => dry()}>dry clap</button>
      <button onClick={() => wet()}>wet clap</button>
    </div>
  );
}
