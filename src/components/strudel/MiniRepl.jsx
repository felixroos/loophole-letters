import { Codemirror } from "../codemirror/Codemirror.jsx";
import { createSignal } from "solid-js";

export function MiniRepl(props) {
  const [code, setCode] = createSignal(props.value?.trim() || "");
  const update = () => {
    console.log("update", code());
  };
  const stop = () => {
    console.log("stop");
  };
  return (
    <div>
      <Codemirror
        {...{
          initialCode: code(),
          onChange: setCode,
          onEvaluate: () => update(),
          onStop: () => stop(),
        }}
      />
    </div>
  );
}
