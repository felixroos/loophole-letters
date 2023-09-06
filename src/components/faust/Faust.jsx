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
  return generator.createNode(ac, "FaustMonoDSP", {
    module,
    json: JSON.stringify(dspMeta),
  });
};

let audioContext, clapBuffer, reverb;

async function dry() {
  const ac = audioContext || new AudioContext();

  const source = ac.createBufferSource();
  source.buffer = clapBuffer || (await loadClapBuffer(ac));

  source.connect(ac.destination);
  source.start();
}

async function wet() {
  const ac = audioContext || new AudioContext();

  const source = ac.createBufferSource();
  source.buffer = clapBuffer || (await loadClapBuffer(ac));
  const faustNode = reverb ? reverb : await loadFaustReverb(ac);

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
