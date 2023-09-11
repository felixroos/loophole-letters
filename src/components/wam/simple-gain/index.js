import { WebAudioModule } from "@webaudiomodules/sdk";

// example from https://www.npmjs.com/package/@webaudiomodules/sdk
export default class SimpleGainPlugin extends WebAudioModule {
  // The plugin redefines the async method createAudionode()
  // that must return an <Audionode>
  async createAudioNode(options) {
    return new GainNode(this.audioContext, options);
  }
}
