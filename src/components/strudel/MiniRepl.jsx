import { createEffect, createSignal } from "solid-js";
import { transpiler } from "@strudel/transpiler";
import { silence, controls, evalScope } from "@strudel/core";
import { StrudelMirror } from "@strudel/codemirror";

export function loadModules() {
  let modules = [
    import("@strudel/core"),
    import("@strudel/tonal"),
    import("@strudel/mini"),
    import("@strudel/codemirror"),
  ];
  return evalScope(controls, ...modules);
}

let prebaked, modulesLoading, audioLoading;
if (typeof window !== "undefined") {
  modulesLoading = loadModules();
  // audioLoading = initAudioOnFirstClick();
}

export function MiniRepl(props) {
  const id = Date.now();
  const [code, setCode] = createSignal(props.value?.trim() || "");
  const [replState, setReplState] = createSignal({});
  createEffect(() => {
    console.log("replState", replState());
  });

  const update = () => {
    console.log("update", code());
  };
  const stop = () => {
    console.log("stop");
  };

  return (
    <div
      ref={(el) => {
        const editor = new StrudelMirror({
          id,
          defaultOutput: (...args) => {
            console.log("output", args);
          },
          getTime: () => performance.now() / 1000,
          transpiler,
          autodraw: false,
          root: el,
          initialCode: "// LOADING",
          pattern: silence,
          // drawTime: [0, 0],
          //onDraw,
          prebake: async () =>
            Promise.all([modulesLoading, prebaked, audioLoading]),
          onUpdateState: (state) => {
            setReplState({ ...state });
          },
        });
        // init settings
        editor.setCode(code);
      }}
    ></div>
  );
}
