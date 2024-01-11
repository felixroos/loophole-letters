class DSPProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.t = 0; // samples passed
    this.port.onmessage = (e) => {
      const key = Object.keys(e.data)[0];
      const value = e.data[key];
      switch (key) {
        case "webassembly":
          WebAssembly.instantiate(value, {
            environment: { SAMPLERATE: globalThis.sampleRate },
            env: {
              abort: () =>
                console.log("webassembly synth abort, should not happen"),
            },
          }).then((result) => {
            this.api = result.instance.exports;
            this.port.postMessage("OK");
          });
          break;
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (this.api) {
      const output = outputs[0];
      for (let i = 0; i < output[0].length; i++) {
        let out = this.api.dsp(this.t / globalThis.sampleRate);
        output.forEach((channel) => {
          channel[i] = out;
        });
        this.t++;
      }
    }
    return true;
  }
}
registerProcessor("dsp-processor", DSPProcessor);
