// https://github.com/goldenratio/wasm-helloworld/blob/master/src/as-utils.js
// @ts-nocheck
// https://github.com/AssemblyScript/assemblyscript/issues/259

const hasBigInt64 = typeof BigUint64Array !== "undefined";
let mem, I8, U8, I16, U16, I32, U32, F32, F64, I64, U64;

const checkMem = (asModule) => {
  if (mem !== asModule.memory.buffer) {
    mem = asModule.memory.buffer;
    I8 = new Int8Array(mem);
    U8 = new Uint8Array(mem);
    I16 = new Int16Array(mem);
    U16 = new Uint16Array(mem);
    I32 = new Int32Array(mem);
    U32 = new Uint32Array(mem);
    if (hasBigInt64) {
      I64 = new BigInt64Array(mem);
      U64 = new BigUint64Array(mem);
    }
    F32 = new Float32Array(mem);
    F64 = new Float64Array(mem);
  }
};

export const newString = (asModule, str) => {
  const dataLength = str.length;
  const ptr = asModule["memory.allocate"](4 + (dataLength << 1));
  const dataOffset = (4 + ptr) >>> 1;
  checkMem();
  U32[ptr >>> 2] = dataLength;
  for (let i = 0; i < dataLength; ++i) U16[dataOffset + i] = str.charCodeAt(i);
  return ptr;
};

export const freeString = (asModule, ptr) => {
  asModule["memory.free"](ptr);
  checkMem();
};

export const getString = (asModule, ptr) => {
  checkMem(asModule);
  const dataLength = U32[(ptr - 4) >>> 2] / 2;
  let dataOffset = ptr >>> 1;
  return String.fromCharCode.apply(
    String,
    U16.subarray(dataOffset, dataOffset + dataLength)
  );
};

export let asModule = undefined;

export const setASModuleExports = (exports) => {
  asModule = exports;
};

/////////////////
class DSPProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.t = 0; // samples passed
    this.port.onmessage = (e) => {
      const key = Object.keys(e.data)[0];
      const value = e.data[key];
      switch (key) {
        case "webassembly":
          this.inited = WebAssembly.instantiate(value, {
            environment: { SAMPLERATE: globalThis.sampleRate },
            env: {
              log: async (x) => {
                await this.inited;
                const s = getString(this.api, x);
                console.log("[log]: " + s);
              },
              abort: () =>
                console.log("webassembly synth abort, should not happen"),
            },
          }).then((result) => {
            this.api = result.instance.exports;
            this.port.postMessage("OK");
          });
          break;
        case "note":
          const { note, velocity } = e.data;
          //console.log("note", note, velocity);
          this.api.midiNote(note, velocity);
          break;
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (this.api) {
      const output = outputs[0];
      for (let i = 0; i < output[0].length; i++) {
        let out = this.api.dsp(this.t / globalThis.sampleRate);
        output.forEach((channel) => {
          channel[i] = out;
        });
        this.t++;
      }
    }
    return true;
  }
}
registerProcessor("dsp-processor", DSPProcessor);
