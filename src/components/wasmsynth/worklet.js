class WasmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.t = 0; // samples passed
    this.f = 110;
    this.active = true;
    this.port.onmessage = (e) => {
      const key = Object.keys(e.data)[0];
      const value = e.data[key];
      switch (key) {
        case "webassembly":
          WebAssembly.instantiate(value, this.importObject).then((result) => {
            this.api = result.instance.exports;
            this.port.postMessage("OK");
          });
          break;
        case "frequency":
          this.f = value;
          break;
        case "stop":
          console.log("stop");
          this.active = false;
      }
    };
  }

  process(inputs, outputs, parameters) {
    if (this.api && outputs[0][0]) {
      const output = outputs[0];
      for (let i = 0; i < output[0].length; i++) {
        let t = this.t;
        let out = 0;
        out = this.api.saw(t / 44100, this.f);
        output.forEach((channel) => {
          channel[i] = out;
        });
        this.t++;
      }
    }
    return this.active;
  }
}
registerProcessor("wasm-processor", WasmProcessor);
