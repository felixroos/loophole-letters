import { EditorView, basicSetup } from "codemirror";
import strudelTheme from "../../lib/codemirror/strudel-theme.mjs";
import { javascript } from "@codemirror/lang-javascript";

export function initEditor({
  root,
  initialCode,
  onChange,
  onEvaluate,
  onStop,
}) {
  let editor = new EditorView({
    extensions: [
      basicSetup,
      strudelTheme,
      javascript(),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          onChange?.(v.state.doc.toString());
        }
      }),
    ],
    parent: root,
  });
  const setCode = (code) => {
    const changes = {
      from: 0,
      to: editor.state.doc.length,
      insert: code,
    };
    editor.dispatch({ changes });
  };
  setCode(initialCode);

  root.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.code === "Enter") {
      onEvaluate?.();
    } else if (e.ctrlKey && e.key === ".") {
      onStop?.();
    }
  });
}
