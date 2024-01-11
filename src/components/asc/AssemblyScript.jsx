import { CodeRunner } from "../coderunner/CodeRunner";
import { compileAssemblyScript } from "./compiler";
// import javascriptmusic from "./sources";
//...javascriptmusic,

export function AssemblyScript(props) {
  return (
    <CodeRunner
      run={async (code) => {
        //console.log(code);
        const output = await compileAssemblyScript(code);
        
        const wasm = await WebAssembly.instantiate(output.binary, {});
        const main = wasm.instance.exports.main;
        const result = main();
        return result;
      }}
      {...props}
    />
  );
}
