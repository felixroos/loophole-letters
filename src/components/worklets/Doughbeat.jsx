import { createSignal } from "solid-js";
// import workletsUrl from "../../lib/worklets/sine-processor?url";
import { getDoughbeatWorklet } from "../../lib/worklets/dynamic-worklet";
import { Scope } from "../scope/Scope";

export function Doughbeat(props) {
  const [value, setValue] = createSignal(props.value?.trim() || "");
  const [playing, setPlaying] = createSignal(false);
  const [analyser, setAnalyser] = createSignal();

  let worklet, ac, analyserData;

  function init() {
    if (!ac) {
      ac = new AudioContext();
    }
    if (!analyser()) {
      // analyser
      const _analyser = ac.createAnalyser();
      _analyser.fft = 2048;
      analyserData = new Float32Array(_analyser.frequencyBinCount);
      setAnalyser(_analyser);
    }
  }

  const stop = async () => {
    worklet?.stop();
    worklet?.node?.disconnect();
    analyser()?.disconnect();
    setAnalyser();
    setPlaying(false);
  };
  const update = async () => {
    stop();
    init();
    await ac.resume();
    worklet = await getDoughbeatWorklet(ac, value());
    worklet.node.connect(ac.destination);
    worklet.node.connect(analyser());
    setPlaying(true);
  };
  return (
    <div class="bg-blue-100 p-2 my-2 rounded-md">
      <div class="flex items-start space-x-2">
        <textarea
          spellCheck={false}
          class="grow rounded-md w-full"
          value={value()}
          onInput={(e) => setValue(e.target.value)}
          ref={(el) => {
            el.addEventListener("keydown", (e) => {
              if (e.ctrlKey && e.code === "Enter") {
                update();
              } else if (e.ctrlKey && e.key === ".") {
                stop();
              }
            });
          }}
          rows={props.rows || 1}
        ></textarea>
        <button
          class="bg-gray-800 text-white rounded-md h-12 px-2"
          onClick={() => (!playing() ? update() : stop())}
        >
          {playing() ? "stop" : "play"}
        </button>
      </div>
      {analyser() && <Scope analyser={analyser()} />}
    </div>
  );
}
