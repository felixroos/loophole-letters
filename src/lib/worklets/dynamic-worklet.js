import { getWorklet } from "./get-worklet";

export async function getDynamicWorklet(ac, name, hooks, params = []) {
  console.log(hooks)
  hooks =
    typeof hooks === "string"
      ? eval(`(() => {
        ${hooks};
        return {
          setup: typeof setup !== 'undefined' ? setup : () => {},
          sample
        }
      })()`)
      : hooks;
  const workletCode = `class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.r = 1 / ${ac.sampleRate}; // inverse sample rate
    this.PI2 = Math.PI*2;
    this.h = 2 * Math.PI * this.isr; // 1Hz in radians
    this.p = 0; // phase
    ${hooks.setup ? `(${hooks.setup})(this)` : ``};
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    ${params
      .map((param) => `const ${param.name} = parameters["${param.name}"];`)
      .join("\n")}
    ${hooks.block ? `(${hooks.block})(this, parameters)` : ""}

    for (let i = 0; i < output[0].length; i++) {
      const inputs = {i,h:this.h,r:this.r, p:(n) => parameters[n][i],s:this};
      const out = (${hooks.sample})(inputs);
      output.forEach((channel) => {
        channel[i] = out;
      });
    }
    return true;
  }
  static get parameterDescriptors() {
    return ${JSON.stringify(params)};
  }
}
registerProcessor('${name}', MyProcessor);
  `;
  const base64String = btoa(workletCode);
  const dataURL = `data:text/plain;base64,${base64String}`;
  await ac.audioWorklet.addModule(dataURL);
  return getWorklet(ac, name, {});
}
