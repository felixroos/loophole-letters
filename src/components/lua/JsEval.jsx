import { CodeRunner } from "../coderunner/CodeRunner";

export function JsEval(props) {
  return <CodeRunner run={(code) => eval(code)} {...props} />;
}
