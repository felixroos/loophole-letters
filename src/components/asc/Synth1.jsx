import sources from "./synth1";
import { AssemblyScriptDSP } from "./AssemblyScriptDSP";

export function Synth1(props) {
  return <AssemblyScriptDSP files={sources} {...props} />;
}
