import { initEditor } from "./codemirror.mjs";

export function Codemirror(props) {
  return (
    <div class="grow rounded-md max-h-64 overflow-auto w-full max-w-full">
      <div
        class="w-full max-w-full overflow-hidden h-full"
        ref={(el) =>
          initEditor({
            root: el,
            ...props,
          })
        }
      ></div>
    </div>
  );
}
