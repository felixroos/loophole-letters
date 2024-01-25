import { createSignal } from "solid-js";
import { compileAssemblyScript } from "./compiler";
import workletCode from "./worklet?raw";
import { Scope } from "../scope/Scope";
import dough from "./dough/dough?raw";
import sources from "./synth1";
import { initEditor } from "../codemirror/codemirror.mjs";

function enableMidi() {
  return new Promise((resolve, reject) => {
    navigator.requestMIDIAccess().then(resolve, reject);
  });
}

export function VoiceAllocator(props) {
  const [code, setCode] = createSignal(props.value?.trim() || "");
  const [activeCode, setActiveCode] = createSignal(props.value?.trim() || "");
  const canUpdate = () => activeCode() !== code();
  const [playing, setPlaying] = createSignal(false);
  const [analyser, setAnalyser] = createSignal();
  const [midiInputs, setMidiInputs] = createSignal([]);
  const [selectedMidiInput, setSelectedMidiInput] = createSignal(null);

  const selectMidiInput = (id) => {
    console.log("select", id);
    const match = midiInputs().find((input) => input.id === id);
    setSelectedMidiInput(match);
  };

  enableMidi()
    .then((res) => {
      const inputs = Object.values(Object.fromEntries(res.inputs));
      console.log("midi ready", inputs);
      if (!inputs.length) {
        return;
      }
      setMidiInputs(inputs);
      selectMidiInput(inputs[0].id);
      inputs.forEach((entry) => {
        entry.onmidimessage = (msg) => {
          const msgType = msg.data[0] & 0xf0;
          if (msgType === 0x90 || msgType === 0x80) {
            const note = msg.data[1];
            const velocity = msgType === 0x80 ? 0 : msg.data[2];
            //processNoteMessage(note, velocity);
            worklet?.port.postMessage({ note, velocity });
          } else {
            console.log("onmidi");
            //onmidi([msgType + channel, msg.data[1], msg.data[2]]);
          }
        };
      });
    })
    .catch((err) => {
      console.log("midi err", err);
    });

  let worklet, ac, analyserData;
  async function init() {
    if (!ac) {
      ac = new AudioContext();
    }
    if (!analyser()) {
      // analyser
      const _analyser = ac.createAnalyser();
      _analyser.fftSize = props.fftSize || 2048;
      analyserData = new Float32Array(_analyser.frequencyBinCount);
      setAnalyser(_analyser);
    }
    // worklet
    if (!worklet) {
      const dataURL = `data:text/javascript;base64,${btoa(workletCode)}`;
      await ac.audioWorklet.addModule(dataURL);
      worklet = new AudioWorkletNode(ac, "dsp-processor");
      worklet.connect(ac.destination);
      worklet.connect(analyser());
      worklet.port.onmessage = (e) => {
        if (e.data === "OK") {
          console.log("worklet ready");
        }
      };
    }
  }
  const stop = async (isUpdate = false) => {
    // worklet?.stop();
    worklet?.disconnect();
    worklet = null;
    analyser()?.disconnect();
    setAnalyser();
    !isUpdate && setPlaying(false);
  };

  const update = async () => {
    // stop(true);
    await init();
    await ac.resume();
    setActiveCode(code());
    try {
      console.log("compile...");
      const output = await compileAssemblyScript(code(), {
        ...sources,
        "dough.ts": dough,
      });
      console.log("compiled!");
      worklet.port.postMessage({ webassembly: output.binary });
      setPlaying(true);
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div class="bg-slate-200 p-2 my-2 rounded-md space-y-2 border-gray-500 border">
      <div class="flex items-start space-x-2">
        <div class="flex flex-col space-y-2">
          <button
            class="bg-slate-800 text-white rounded-md h-12 px-2 w-20"
            onClick={() => (!playing() ? update() : stop())}
          >
            {playing() ? "stop" : "play"}
          </button>
          {canUpdate() && (
            <button
              class="bg-stone-800 text-white rounded-md h-12 px-2 w-20"
              onClick={() => update()}
            >
              update
            </button>
          )}
          {!canUpdate() && (
            <button class="bg-slate-400 text-white rounded-md h-12 px-2 w-20">
              update
            </button>
          )}
        </div>
        <div
          class="grow rounded-md w-full max-w-full overflow-hidden h-full outline-none focus:outline-none focus:ring-0 focus:border-gray-500"
          ref={(el) =>
            initEditor({
              root: el,
              initialCode: code(),
              onChange: setCode,
              onEvaluate: () => update(),
              onStop: () => stop(),
            })
          }
        ></div>
      </div>
      {selectedMidiInput() && midiInputs()?.length && (
        <select value={selectedMidiInput().id} onChange={selectMidiInput}>
          {midiInputs().map((input) => (
            <option value={input.id}>{input.name}</option>
          ))}
        </select>
      )}
      <Scope analyser={analyser()} options={props.options} />
    </div>
  );
}
