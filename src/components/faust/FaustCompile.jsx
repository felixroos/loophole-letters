import { createSignal } from "solid-js";
import {
  instantiateFaustModuleFromFile,
  LibFaust,
  FaustMonoDspGenerator,
  FaustCompiler,
} from "@grame/faustwasm";
import libfaustwasm from "@grame/faustwasm/libfaust-wasm/libfaust-wasm.js?url";

async function loadCompiler() {
  const faustModule = await instantiateFaustModuleFromFile(libfaustwasm);
  const libFaust = new LibFaust(faustModule);
  return new FaustCompiler(libFaust);
}

let compiler, ac, node;

async function compile(code) {
  compiler = compiler || (await loadCompiler());
  ac = ac || new AudioContext();
  const generator = new FaustMonoDspGenerator();

  const name = "FaustCompile";
  const argv = ["-I", "libraries/"];
  const compiled = await generator.compile(
    compiler,
    name,
    code,
    argv.join(" ")
  );

  return generator.createNode(ac, "FaustMonoDSP", compiled.factory);
}
const compileAndRun = async (code) => {
  node?.stop();
  node = await compile(code);
  node.connect(ac.destination);
};

export function FaustCompile(props) {
  const [value, setValue] = createSignal(props.value);
  return (
    <div>
      <textarea
        class="grow rounded-md w-full"
        value={value()}
        onInput={(e) => setValue(e.target.value)}
        rows={8}
        ref={(el) =>
          el.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.code === "Enter") {
              compileAndRun(value());
            } else if (e.ctrlKey && e.key === ".") {
              node?.stop();
            }
          })
        }
      ></textarea>
      <div class="flex space-x-2">
        <button onClick={() => compileAndRun(value())}>start</button>
        <button onClick={() => node?.stop()}>stop</button>
      </div>
    </div>
  );
}
