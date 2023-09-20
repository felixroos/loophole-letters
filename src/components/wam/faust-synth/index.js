/* import { WebAudioModule } from "@webaudiomodules/sdk";
import {
  CompositeAudioNode,
  ParamMgrFactory,
} from "@webaudiomodules/sdk-parammgr";
import { FaustMonoDspGenerator, FaustPolyDspGenerator } from "@grame/faustwasm";

import dspModuleUrl from "./dspModule.wasm?url";
import mixerModuleUrl from "./mixerModule.wasm?url";
import dspMeta from "./dspMeta.json";

export const loadFaustSynth = async (ac) => {
  const [module, mixerModule] = await Promise.all([
    WebAssembly.compileStreaming(fetch(dspModuleUrl)),
    WebAssembly.compileStreaming(fetch(mixerModuleUrl)),
  ]);
  const generator = new FaustPolyDspGenerator();
  const node = await generator.createNode(
    ac,
    16, // voices
    "FaustPolyDSP",
    {
      module,
      json: JSON.stringify(dspMeta),
    },
    mixerModule
  );
  node.connect(ac.destination);
  return node;
};

class FaustCompositeAudioNode extends CompositeAudioNode {
  setup(output, paramMgr) {
    if (output.numberOfInputs > 0) this.connect(output, 0, 0);
    paramMgr.addEventListener("wam-midi", (e) =>
      output.midiMessage(e.detail.data.bytes)
    );
    this._wamNode = paramMgr;
    this._output = output;
  }

  destroy() {
    super.destroy();
    if (this._output) this._output.destroy();
  }

  getParamValue(name) {
    return this._wamNode.getParamValue(name);
  }

  setParamValue(name, value) {
    return this._wamNode.setParamValue(name, value);
  }
}

const getBasetUrl = (relativeURL) => {
  const baseURL = relativeURL.href.substring(
    0,
    relativeURL.href.lastIndexOf("/")
  );
  return baseURL;
};

export default class FaustPlugin extends WebAudioModule {
  _PluginFactory;
  _baseURL = getBasetUrl(new URL(".", import.meta.url));
  _descriptorUrl = `${this._baseURL}/descriptor.json`;

  async initialize(state) {
    console.log("_descriptorUrl", this._descriptorUrl);
    await this._loadDescriptor();
    return super.initialize(state);
  }

  async createAudioNode(initialState) {
    const faustNode = await loadFaustSynth(this.audioContext);
    console.log("faustNode.getJSON()", JSON.parse(faustNode.getJSON()));
    console.log(
      "faustNode.parameters",
      faustNode.getParams(),
      faustNode.parameters
    );
    const paramMgrNode = await ParamMgrFactory.create(this, {
      internalParamsConfig: Object.fromEntries(faustNode.parameters),
    });
    console.log("paramMgrNode", paramMgrNode, paramMgrNode.parameters);
    const node = new FaustCompositeAudioNode(this.audioContext);
    node.setup(faustNode, paramMgrNode);
    if (initialState) node.setState(initialState);
    return node;
  }

  createGui() {
    console.log("i dont care about gui");
  }
}
 */