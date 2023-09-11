import { WebAudioModule } from "@webaudiomodules/sdk";

// example from https://www.npmjs.com/package/@webaudiomodules/sdk
export default class SimpleOSCPlugin extends WebAudioModule {
  // The plugin redefines the async method createAudionode()
  // that must return an <Audionode>
  async createAudioNode(options) {
    const osc = new OscillatorNode(this.audioContext, options);

    return osc;
  }

  start(time) {
    this._audioNode.start(time);
  }
}
