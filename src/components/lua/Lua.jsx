import { LuaFactory } from "wasmoon";
import { CodeRunner } from "../coderunner/CodeRunner";

const factory = new LuaFactory();
const lua = await factory.createEngine();

export function Lua(props) {
  return (
    <CodeRunner
      run={async (code) => {
        await lua.doString(code);
        const main = lua.global.get("main");
        return main?.();
      }}
      {...props}
    />
  );
}
