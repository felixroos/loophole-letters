import { CodeRunner } from "../coderunner/CodeRunner";
import asc from "assemblyscript/asc";
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

async function compileAssemblyScript(code) {
  const output = Object.create({
    stdout: asc.createMemoryStream(),
    stderr: asc.createMemoryStream(),
  });
  const sources = {
    "index.ts": code,
  };
  const { error } = await asc.main(
    ["--outFile", "binary", "--textFile", "text", "index.ts"],
    {
      stdout: output.stdout,
      stderr: output.stderr,
      readFile: (name) => (sources.hasOwnProperty(name) ? sources[name] : null),
      writeFile: (name, contents) => (output[name] = contents),
      listFiles: () => [],
    }
  );
  if (error) {
    throw new Error(error.message);
  }
  return output;
}

/*


function compileAssemblyScript(sources, options, entrypoint) {
    if (typeof sources === "string") sources = { "input.ts": sources };
    const output = Object.create({
        stdout: asc.createMemoryStream(),
        stderr: asc.createMemoryStream()
    });
    var argv = [
        "--binaryFile", "binary",
        "--textFile", "text",
    ];
    Object.keys(options || {}).forEach(key => {
        var val = options[key];
        if (Array.isArray(val)) val.forEach(val => argv.push("--" + key, String(val)));
        else argv.push("--" + key, String(val));
    });
    asc.main(entrypoint ? argv.concat(entrypoint) : argv.concat(Object.keys(sources)), {
        stdout: output.stdout,
        stderr: output.stderr,
        readFile: name => sources.hasOwnProperty(name) ? sources[name] : null,
        writeFile: (name, contents) => output[name] = contents,
        listFiles: () => []
    });

    return output;
}
*/
