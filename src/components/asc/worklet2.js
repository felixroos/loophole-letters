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
const SAMPLE_FRAMES = 128;
/////////////////
class DSPProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
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
                const s = getString(this.wasm, x);
                console.log("[log]: " + s);
              },
              abort: () =>
                console.log("webassembly synth abort, should not happen"),
            },
          }).then((result) => {
            this.wasmInstance = result.instance.exports;
            this.inputStart = this.wasmInstance.getInputBuffer();
            this.inputBuffer = new Float32Array(
              this.wasmInstance.memory.buffer,
              this.inputStart,
              SAMPLE_FRAMES
            );
            this.leftOutputBuffer = new Float32Array(
              this.wasmInstance.memory.buffer,
              this.wasmInstance.getLeftOutputBuffer(),
              SAMPLE_FRAMES
            );
            this.rightOutputBuffer = new Float32Array(
              this.wasmInstance.memory.buffer,
              this.wasmInstance.getRightOutputBuffer(),
              SAMPLE_FRAMES
            );
            this.port.postMessage("OK");
          });
          break;
        case "note":
          const { note, velocity } = e.data;
          this.wasmInstance.midiNote(note, velocity);
          break;
      }
    };
  }
  process(inputList, outputList, parameters) {
    const output = outputList[0];
    if (this.wasmInstance) {
      /* for (let i = 0; i < inputList.length; i++) {
        this.inputBuffer.set(inputList[i][0]);
      } */
      this.wasmInstance.block(
        globalThis.currentFrame,
        globalThis.currentFrame + 128
      );
      output[0].set(this.leftOutputBuffer);
      output[1].set(this.rightOutputBuffer);
    }
    return true;
  }
}
registerProcessor("dsp-processor", DSPProcessor);
