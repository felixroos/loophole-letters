import { createSignal } from "solid-js";
// import workletsUrl from "../../lib/worklets/sine-processor?url";
import { getDynamicWorklet } from "../../lib/worklets/dynamic-worklet";

export function Worklet(props) {
  const [value, setValue] = createSignal(props.value || "");

  let node;
  const update = async () => {
    const ac = new AudioContext();
    if (node) {
      node.disconnect();
    }
    node = await getDynamicWorklet(ac, "custom-processor", value());
    node.connect(ac.destination);
  };
  return (
    <div>
      <textarea
        class="grow rounded-md w-full"
        value={value()}
        onInput={(e) => setValue(e.target.value)}
        ref={(el) => {
          el.addEventListener("keypress", (e) => {
            // console.log("e", e);
            if (e.ctrlKey && e.code === "Enter") {
              update();
            }
          });
        }}
        rows={12}
      ></textarea>
      <button onClick={() => update()}>play</button>
    </div>
  );
}
