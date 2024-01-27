import { createSignal } from "solid-js";
import { compileAssemblyScript } from "./compiler";
import workletCode from "./worklet2?raw";
import { Scope } from "../scope/Scope";
import { initEditor } from "../codemirror/codemirror.mjs";

export function AssemblyScriptDSP2(props) {
  const [code, setCode] = createSignal(props.value?.trim() || "");
  const [activeCode, setActiveCode] = createSignal(props.value?.trim() || "");
  const canUpdate = () => activeCode() !== code();
  const [playing, setPlaying] = createSignal(false);
  const [analyser, setAnalyser] = createSignal();

  let worklet, ac, analyserData;
  async function init() {
    if (!ac) {
      ac = new AudioContext();
    }
    if (!analyser()) {
      // analyser
      const _analyser = ac.createAnalyser();
      _analyser.fftSize = props.fftSize || 2048;
      analyserData = new Float32Array(_analyser.frequencyBinCount);
      setAnalyser(_analyser);
    }
    // worklet
    if (!worklet) {
      const dataURL = `data:text/javascript;base64,${btoa(workletCode)}`;
      await ac.audioWorklet.addModule(dataURL);
      worklet = new AudioWorkletNode(ac, "dsp-processor", {
        outputChannelCount: [2],
      });
      worklet.connect(ac.destination);
      worklet.connect(analyser());
      worklet.port.onmessage = (e) => {
        if (e.data === "OK") {
          console.log("worklet ready");
        }
      };
    }
  }
  const stop = async (isUpdate = false) => {
    // worklet?.stop();
    worklet?.disconnect();
    worklet = null;
    analyser()?.disconnect();
    setAnalyser();
    !isUpdate && setPlaying(false);
  };

  const update = async () => {
    // stop(true);
    await init();
    await ac.resume();
    setActiveCode(code());
    try {
      const output = await compileAssemblyScript(
        `${code()}
      export const input = new StaticArray<f32>(128);
      export function getInputBuffer(): StaticArray<f32> {
        return input;
      }
      export const leftOutput = new StaticArray<f32>(128);
      export const rightOutput = new StaticArray<f32>(128);
      export function getLeftOutputBuffer(): StaticArray<f32> {
        return leftOutput;
      }
      export function getRightOutputBuffer(): StaticArray<f32> {
        return rightOutput;
      }
      let tx: f32 = 0.0;
      export function block(t1: i32, t2: i32): void {
        for (let t = t1; t < t2; t++) {
          const i = t-t1;
          const out = dsp((t as f32) / 44100.0, tx / 44100.0);
          leftOutput[i] = out[0];
          rightOutput[i] = out[1%out.length];
          tx++;
        }
      }`,
        {
          ...props.files,
        }
      );
      worklet.port.postMessage({ webassembly: output.binary });
      setPlaying(true);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div class="bg-slate-200 p-2 my-2 rounded-md space-y-2 border-gray-500 border">
      <div class="flex items-start space-x-2">
        <div class="flex flex-col space-y-2">
          <button
            class="bg-slate-800 text-white rounded-md h-12 px-2 w-20"
            onClick={() => (!playing() ? update() : stop())}
          >
            {playing() ? "stop" : "play"}
          </button>
          {canUpdate() && (
            <button
              class="bg-stone-800 text-white rounded-md h-12 px-2 w-20"
              onClick={() => update()}
            >
              update
            </button>
          )}
          {!canUpdate() && (
            <button class="bg-slate-400 text-white rounded-md h-12 px-2 w-20">
              update
            </button>
          )}
        </div>
        <div
          class="grow rounded-md w-full max-w-full overflow-hidden h-full outline-none focus:outline-none focus:ring-0 focus:border-gray-500"
          ref={(el) =>
            initEditor({
              root: el,
              initialCode: code(),
              onChange: setCode,
              onEvaluate: () => update(),
              onStop: () => stop(),
            })
          }
        ></div>
      </div>
      <Scope analyser={analyser()} options={props.options} />
    </div>
  );
}

