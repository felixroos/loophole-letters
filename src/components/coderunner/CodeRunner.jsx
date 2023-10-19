import { createSignal } from "solid-js";

export function CodeRunner(props) {
  const [code, setCode] = createSignal(props.value?.trim() || "");
  const [took, setTook] = createSignal(undefined);
  const [error, setError] = createSignal("");
  const [result, setResult] = createSignal();
  const run = async () => {
    try {
      setError("");
      let started = performance.now();
      let _res = await props.run(code());
      setTook(performance.now() - started);
      setResult(_res);
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <div class="bg-slate-200 p-2 my-2 rounded-md space-y-2 border-gray-500 border not-prose">
      <div class="flex items-start space-x-2">
        <div class="flex flex-col space-y-2">
          <button
            class="bg-stone-800 text-white rounded-md h-12 px-2 w-20"
            onClick={() => run()}
          >
            run
          </button>
        </div>
        <div class="flex flex-col w-full">
          <textarea
            spellCheck={false}
            class="grow rounded-md w-full outline-none focus:outline-none focus:ring-0 focus:border-gray-500"
            value={code()}
            onInput={(e) => setCode(e.target.value)}
            ref={(el) => {
              el.addEventListener("keydown", (e) => {
                if (e.ctrlKey && e.code === "Enter") {
                  run();
                }
              });
            }}
            rows={props.rows || 4}
          />
          <div>
            <div class="flex justify-between w-full">
              <pre>{!error() ? result() : ""}</pre>
              <span>{took()}ms</span>
            </div>
            <div class="text-red-800">{error()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
