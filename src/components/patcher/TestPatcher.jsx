import { createSignal, onMount } from "solid-js";
import { Patcher } from "./Patcher";

function Slider(props) {
  const [value, setValue] = createSignal(props.initialValue ?? 0);
  return (
    <div class="items-end flex flex-col p-2">
      <input
        type="range"
        value={value()}
        onInput={(e) => {
          const next = Number(e.target.value);
          setValue(next);
          props.onChange(next);
        }}
        min={props.min ?? 0}
        max={props.max ?? 1}
        step={props.step ?? 0.01}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      />
      <div>{value().toFixed(2)}</div>
    </div>
  );
}

let ctx,
  audioOutput,
  started,
  fadeTime = 0.1,
  state;
let fade = (gainNode, from, to, fadeTime, time = ctx.currentTime) => {
  gainNode.gain.setValueAtTime(from, time);
  gainNode.gain.linearRampToValueAtTime(to, time + fadeTime);
};
function osc(freq) {
  const osc = ctx.createOscillator();
  osc.frequency.value = freq;
  osc.detune.value = 2;
  osc.start();
  return osc;
}
function gain2x() {
  const g = ctx.createGain();
  g.gain.value = 100;
  return g;
}
const instances = {};

function renderGraph(nodes, connections) {
  state = { nodes, connections };
  if (!started) {
    return;
  }
  // destroy previous graph
  if (audioOutput) {
    fade(audioOutput, 1, 0, fadeTime);
    let old = audioOutput;
    setTimeout(() => {
      old.disconnect();
      console.log("disconnect", old);
    }, fadeTime * 2000);
    Object.values(instances).forEach((instance) => {
      setTimeout(() => {
        console.log("disconnect", instance);
        instance?.disconnect();
      }, fadeTime * 2000);
    });
  }
  // start new graph
  audioOutput = ctx.createGain();
  audioOutput.connect(ctx.destination);
  fade(audioOutput, 0, 1, fadeTime);
  //console.log("changeGraph", nodes, connections);
  nodes.forEach((node) => {
    if (node.type === "osc") {
      instances[node.id] = osc(110);
    } else if (node.type === "lfo") {
      instances[node.id] = osc(8);
    } else if (node.type === "gain2x") {
      instances[node.id] = gain2x();
    }
  });
  //console.log("instances", instances);
  let port2node = (portId) => portId.split(":").slice(0, 2).join(":");
  connections.forEach(([outlet, inlet]) => {
    const fromId = port2node(outlet);
    const toId = port2node(inlet);
    const inletName = inlet.split(":").slice(-1)[0];
    const source = instances[fromId];
    const isAudioOutput = toId.endsWith(":out");

    let destination;
    if (isAudioOutput) {
      destination = audioOutput;
    } else {
      destination =
        inletName === "in" ? instances[toId] : instances[toId][inletName];
    }
    console.log("connect", fromId, "to", toId);
    source.connect(destination);
  });
}

export function TestPatcher() {
  return (
    <div>
      <Patcher
        onStart={() => {
          ctx = new AudioContext();
          ctx.resume();
          started = true;
          renderGraph(state.nodes, state.connections);
        }}
        init={{
          nodes: [
            { id: "1706871231591:lfo", x: 50, y: 150 },
            { id: "1706871232440:gain2x", x: 180, y: 150 },
            { id: "1706871237562:osc", x: 300, y: 150 },
            { id: "1706871243098:out", x: 450, y: 150 },
          ],
          connections: [
            ["1706871231591:lfo:~", "1706871232440:gain2x:in"],
            ["1706871232440:gain2x:~", "1706871237562:osc:detune"],
            ["1706871237562:osc:~", "1706871243098:out:destination"],
          ],
        }}
        onChangeGraph={renderGraph}
        nodeTypes={[
          /* {
            type: "slider",
            render: Slider,
            outlets: [{ name: "n" }],
          }, */
          {
            type: "osc",
            inlets: [{ name: "frequency" }, { name: "detune" }],
            outlets: [{ name: "~" }],
          },
          {
            type: "lfo",
            inlets: [{ name: "frequency" }],
            outlets: [{ name: "~" }],
          },
          {
            type: "gain2x",
            inlets: [{ name: "in" }],
            outlets: [{ name: "~" }],
          },
          {
            type: "out",
            inlets: [{ name: "destination" }],
          },
        ]}
      />
    </div>
  );
}
