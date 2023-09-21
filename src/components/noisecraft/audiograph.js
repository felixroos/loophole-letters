// https://github.com/maximecb/noisecraft/blob/74b7f395e42c66f852b582138f777d711f3b1765/public/audiograph.js#L136C1-L165C2
class AudioNode {
  constructor(id, state, sampleRate, send) {
    this.nodeId = id;
    this.state = state;
    this.params = state.params;
    this.sampleRate = sampleRate;
    this.sampleTime = 1 / sampleRate;
    this.send = send;
  }

  /**
   * Set a parameter value on a given node
   */
  setParam(paramName, value) {
    assert(paramName in this.params);
    this.params[paramName] = value;
  }

  /**
   * Set/update the entire state for this node
   */
  setState(state) {
    this.state = state;
    this.params = state.params;
  }
}

/**
 * Pulse wave oscillator
 */
class PulseOsc extends AudioNode {
  constructor(id, state, sampleRate, send) {
    super(id, state, sampleRate, send);

    this.phase = 0;
  }

  update(freq, duty) {
    let minVal = this.params.minVal;
    let maxVal = this.params.maxVal;

    this.phase += this.sampleTime * freq;
    let cyclePos = this.phase % 1;
    return cyclePos < duty ? minVal : maxVal;
  }
}

document.addEventListener("click", () => {
  const ac = new AudioContext();
  const osc = new PulseOsc(
    "test",
    { params: { minVal: 0, maxVal: 1 } },
    ac.sampleRate
  );
  const length = ac.sampleRate * 0.5;
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    samples[i] = osc.update(220, 0.5);
  }
  const source = ac.createBufferSource();
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  buffer.getChannelData(0).set(samples);
  source.buffer = buffer;
  console.log(samples.join(""));
  source.connect(ac.destination);
  source.start();
});
