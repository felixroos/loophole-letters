import { createSignal } from "solid-js";
// import workletsUrl from "../../lib/worklets/sine-processor?url";
import { getSimpleDynamicWorklet } from "../../lib/worklets/dynamic-worklet";

export function WorkletSimple(props) {
  const [value, setValue] = createSignal(props.value || "");
  const [playing, setPlaying] = createSignal(false);

  let worklet, ac;
  const stop = async () => {
    worklet?.stop();
    await worklet?.node?.disconnect();
    setPlaying(false);
  };
  const update = async () => {
    ac = ac || new AudioContext();
    await ac.resume();
    //await stop();
    const name = `simple-custom-${Date.now()}`;
    worklet = await getSimpleDynamicWorklet(ac, name, value(), props.hz);
    worklet.node.connect(ac.destination);
    setPlaying(true);
  };
  return (
    <div class="bg-blue-100 p-2 my-2 rounded-md">
      <div class="flex items-start space-x-2">
        <textarea
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
    </div>
  );
}
