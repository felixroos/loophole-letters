/* async function loadWam(groupId, url, audioContext) {
  const { default: pluginFactory } = await import(url);
  return pluginFactory.createInstance(groupId, audioContext, {});
}
//const instance = await loadWam("osc", "./simple-osc/index.js", ac);

export function Wam() {
  return (
    <button
      onClick={async () => {
        const ac = new AudioContext();
        const { initializeWamHost } = await import("@webaudiomodules/sdk");
        const [hostGroupId] = await initializeWamHost(ac);
        // const { default: pluginFactory } = await import(
        //  "./simple-osc/index.js"
        //);
        //const instance = await pluginFactory.createInstance(hostGroupId, ac, {});
        //instance.audioNode.connect(ac.destination);
        //instance.audioNode.start();

        const { default: pluginFactory } = await import(
          "./faust-synth/index.js"
        );
        const instance = await pluginFactory.createInstance(
          hostGroupId,
          ac,
          {}
        );
        instance.audioNode.connect(ac.destination);
        const synth = instance.audioNode._output;

        synth.midiMessage(new Uint8Array([144, 56, 114]));
        synth.midiMessage(new Uint8Array([144, 59, 114]));
        setTimeout(() => {
          synth.midiMessage(new Uint8Array([144, 56, 0]));
          synth.midiMessage(new Uint8Array([144, 59, 0]));
        }, 500);
      }}
    >
      GO
    </button>
  );
}
 */
