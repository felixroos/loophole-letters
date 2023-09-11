export function WamFaust() {
  return (
    <button
      onClick={async () => {
        const ac = new AudioContext();
        const { initializeWamHost } = await import("@webaudiomodules/sdk");
        const [hostGroupId] = await initializeWamHost(ac);

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
        //console.log("synth", instance.audioNode.fDSPCode.fVoiceTable);
        console.log("synth", instance.audioNode._output); // .fDSPCode.fVoiceTable
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
