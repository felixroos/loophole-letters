import dspModuleUrl from "./reverb/dspModule.wasm?url";
import dspMeta from "./reverb/dspMeta.json";
import { FaustMonoDspGenerator } from "@grame/faustwasm";

async function loadClapBuffer(ac) {
  const res = await fetch(
    "https://raw.githubusercontent.com/tidalcycles/Dirt-Samples/master/cp/HANDCLP0.wav"
  );
  const buffer = await res.arrayBuffer();
  const audioBuffer = await ac.decodeAudioData(buffer);
  return audioBuffer;
}

const loadFaustReverb = async (ac) => {
  const module = await WebAssembly.compileStreaming(fetch(dspModuleUrl));
  const generator = new FaustMonoDspGenerator();
  const node = await generator.createNode(ac, "FaustMonoDSP", {
    module,
    json: JSON.stringify(dspMeta),
  });
  node.connect(ac.destination);
  return node;
};

let ac, clapBuffer, reverb;

async function dry() {
  ac = ac || new AudioContext();

  const source = ac.createBufferSource();
  if (!clapBuffer) {
    clapBuffer = loadClapBuffer(ac);
  }
  source.buffer = await clapBuffer;

  source.connect(ac.destination);
  source.start();
}

async function wet() {
  ac = ac || new AudioContext();

  const source = ac.createBufferSource();
  if (!clapBuffer) {
    clapBuffer = loadClapBuffer(ac);
  }
  source.buffer = await clapBuffer;
  if (!reverb) {
    reverb = loadFaustReverb(ac);
  }

  source.connect(await reverb);
  source.start();
}

export function FaustReverb() {
  return (
    <div class="flex space-x-2">
      <button
        class="border border-gray-500 p-2 rounded-md hover:bg-blue-200"
        onClick={() => dry()}
      >
        dry clap
      </button>
      <button
        class="border border-gray-500 p-2 rounded-md hover:bg-blue-200"
        onClick={() => wet()}
      >
        wet clap
      </button>
    </div>
  );
}
