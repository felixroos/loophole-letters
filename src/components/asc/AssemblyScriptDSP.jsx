import { createSignal } from "solid-js";
import { CodeRunner } from "../coderunner/CodeRunner";
import { compileAssemblyScript } from "./compiler";
// import javascriptmusic from "./sources";
//...javascriptmusic,
import workletCode from "./worklet?raw";
import { Scope } from "../scope/Scope";

export function AssemblyScriptDSP(props) {
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
      worklet = new AudioWorkletNode(ac, "dsp-processor");
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
    const output = await compileAssemblyScript(code(), props.files);
    worklet.port.postMessage({ webassembly: output.binary });
    setPlaying(true);
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
        <textarea
          spellCheck={false}
          class="grow rounded-md w-full outline-none focus:outline-none focus:ring-0 focus:border-gray-500"
          value={code()}
          onInput={(e) => setCode(e.target.value)}
          ref={(el) => {
            el.addEventListener("keydown", (e) => {
              if (e.ctrlKey && e.code === "Enter") {
                update();
              } else if (e.ctrlKey && e.key === ".") {
                stop();
              }
            });
          }}
          rows={props.rows || 4}
        ></textarea>
      </div>
      <Scope analyser={analyser()} options={props.options} />
    </div>
  );
}
