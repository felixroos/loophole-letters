import { FaustWasmInstantiator, FaustMonoWebAudioDsp } from "@grame/faustwasm";
import dspModuleUrl from "./reverb/dspModule.wasm?url";
import dspMeta from "./reverb/dspMeta.json";

export function FaustRaw() {
  async function init() {
    const faustModule = await WebAssembly.compileStreaming(fetch(dspModuleUrl));
    const instance = new WebAssembly.Instance(faustModule, wasmEnv);
    console.log(instance);
    return instance;
  }

  async function init2() {
    const context = new AudioContext();
    const module = await WebAssembly.compileStreaming(fetch(dspModuleUrl));
    const instance = await FaustWasmInstantiator.createAsyncMonoDSPInstance({
      module,
      json: JSON.stringify(dspMeta),
    });
    const exports = instance.api.fExports;

    const sampleSize = 4;
    const bufferSize = 1024;
    const monoDsp = new FaustMonoWebAudioDsp(
      instance,
      context.sampleRate,
      sampleSize,
      bufferSize
    );
    let inputs = new Array(exports.getNumInputs()).fill(
      new Float32Array(bufferSize)
    );
    let outputs = new Array(exports.getNumOutputs()).fill(
      new Float32Array(bufferSize)
    );
    monoDsp.start();
    console.log(inputs.length, outputs.length);

    for (let i = 0; i < bufferSize; ++i) {
      inputs[0][i] = Math.sin(i / 20) / 2;
    }
    console.log("monoDsp", monoDsp);
    // console.log(input);
    monoDsp.compute(inputs, outputs);
    const bufferSource = context.createBufferSource();
    context.buffer = outputs[0];
    bufferSource.connect(context.destination);
    bufferSource.start();
    console.log(outputs);
  }
  init();
  return (
    <button
      onClick={async () => {
        await init2();
      }}
    >
      init
    </button>
  );
}

const wasmEnv = {
  env: {
    memory: new WebAssembly.Memory({ initial: 100 }),
    memoryBase: 0,
    tableBase: 0,
    // Integer version
    _abs: Math.abs,
    // Float version
    _acosf: Math.acos,
    _asinf: Math.asin,
    _atanf: Math.atan,
    _atan2f: Math.atan2,
    _ceilf: Math.ceil,
    _cosf: Math.cos,
    _expf: Math.exp,
    _floorf: Math.floor,
    _fmodf: (x, y) => x % y,
    _logf: Math.log,
    _log10f: Math.log10,
    _max_f: Math.max,
    _min_f: Math.min,
    _remainderf: (x, y) => x - Math.round(x / y) * y,
    _powf: Math.pow,
    _roundf: Math.round,
    _sinf: Math.sin,
    _sqrtf: Math.sqrt,
    _tanf: Math.tan,
    _acoshf: Math.acosh,
    _asinhf: Math.asinh,
    _atanhf: Math.atanh,
    _coshf: Math.cosh,
    _sinhf: Math.sinh,
    _tanhf: Math.tanh,
    _isnanf: Number.isNaN,
    _isinff: (x) => !isFinite(x),
    _copysignf: (x, y) => (Math.sign(x) === Math.sign(y) ? x : -x),

    // Double version
    _acos: Math.acos,
    _asin: Math.asin,
    _atan: Math.atan,
    _atan2: Math.atan2,
    _ceil: Math.ceil,
    _cos: Math.cos,
    _exp: Math.exp,
    _floor: Math.floor,
    _fmod: (x, y) => x % y,
    _log: Math.log,
    _log10: Math.log10,
    _max_: Math.max,
    _min_: Math.min,
    _remainder: (x, y) => x - Math.round(x / y) * y,
    _pow: Math.pow,
    _round: Math.round,
    _sin: Math.sin,
    _sqrt: Math.sqrt,
    _tan: Math.tan,
    _acosh: Math.acosh,
    _asinh: Math.asinh,
    _atanh: Math.atanh,
    _cosh: Math.cosh,
    _sinh: Math.sinh,
    _tanh: Math.tanh,
    _isnan: Number.isNaN,
    _isinf: (x) => !isFinite(x),
    _copysign: (x, y) => (Math.sign(x) === Math.sign(y) ? x : -x),
    table: new WebAssembly.Table({ initial: 0, element: "anyfunc" }),
  },
};
