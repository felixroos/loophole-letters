import { createEffect, createSignal, onMount } from "solid-js";
import { Patcher } from "./Patcher";
import { fm } from "./lib";

let ctx = typeof AudioContext !== "undefined" ? new AudioContext() : null,
  audioOutput,
  started,
  fadeTime = 0.1,
  state,
  instances = {};

if (ctx) {
  audioOutput = ctx.destination;
}

function setNodeInlet(inlet, value) {
  const [a, b, c] = inlet.split(":");
  const node = `${a}:${b}`;
  const inletName = c;
  const instance = instances[node];
  if (instance?.[inletName]) {
    instance[inletName].value = value;
    // console.log("set", inletName, value);
  } else {
    console.warn(`instance ${instance} has no inlet ${inletName}`);
  }
}

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
          const inlet = props.getOutletTarget("n");
          setNodeInlet(inlet, next * 1200);
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

function NumberInput(props) {
  // console.log("Number input", props);
  const [value, setValue] = createSignal(props.state ?? 0);
  const update = (v) => {
    setValue(v);
    const inlet = props.getOutletTarget("n");
    props.onChange(v);
    if (inlet) {
      setNodeInlet(inlet, v);
    }
  };
  return (
    <div class="items-end flex flex-col p-2">
      <input
        type="number"
        class="text-xs w-[100px] bg-stone-800 text-white"
        value={value()}
        onInput={(e) => update(Number(e.target.value))}
        onKeyDown={(e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
      />
    </div>
  );
}

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
function gain() {
  const g = ctx.createGain();
  return g;
}

function createNode(node) {
  console.log("create", node);
  try {
    if (node.type === "osc") {
      instances[node.id] = osc(110);
      console.log("create osc");
    } else if (node.type === "lfo") {
      instances[node.id] = osc(8);
    } else if (node.type === "gain") {
      instances[node.id] = gain();
      console.log("create gain");
    } else {
      // console.warn("unhandled node", node);
    }
  } catch (err) {
    console.log("err", err);
  }
}
function deleteNode(node) {
  console.log("delete");
}

let port2node = (portId) => portId.split(":").slice(0, 2).join(":");

function createConnection(outlet, inlet, nodeState) {
  const fromId = port2node(outlet);
  const toId = port2node(inlet);
  const inletName = inlet.split(":").slice(-1)[0];
  const sourceNode = instances[fromId];
  const isAudioOutput = toId.endsWith(":out");
  const isNumber = fromId.endsWith(":number");
  let destination;
  if (sourceNode && isAudioOutput) {
    console.log(`connect ${fromId} to destination`);
    destination = audioOutput;
    sourceNode.connect(audioOutput);
  } else if (isNumber) {
    console.log(`set ${inlet} to ${nodeState[fromId]}`);
    setNodeInlet(inlet, nodeState[fromId]);
  } else if (sourceNode) {
    destination =
      inletName === "in" ? instances[toId] : instances[toId][inletName];
    console.log("connect", sourceNode, destination);
    sourceNode.connect(destination);
  } else {
    console.warn("unhandled connection", fromId, toId);
  }
}

function deleteConnection([outlet, inlet]) {
  console.log("disconnect", outlet, inlet);
  const fromId = port2node(outlet);
  const toId = port2node(inlet);
  const inletName = inlet.split(":").slice(-1)[0];
  const sourceNode = instances[fromId];
  if (sourceNode) {
    sourceNode.disconnect();
  }
}

export function TestPatcher() {
  return (
    <div>
      <Patcher
        onStart={() => {
          ctx.resume();
          started = true;
          console.log("lets goo");
          // renderGraph(state.nodes, state.connections, state.nodeState);
        }}
        init={fm}
        onCreateNode={createNode}
        onDeleteNode={deleteNode}
        onConnect={createConnection}
        onDisconnect={deleteConnection}
        /* onChangeState={(id, state) => {
          const [_, type] = id.split(":");
          if (type === "slider") {
            const outlet = `${id}:n`;
            console.log("outlet", outlet);
            //const con = connections.find(([a, b]) => a === outlet);
            //console.log("change slider", state, con);
          }
        }} */
        nodeTypes={[
          {
            type: "slider",
            render: Slider,
            outlets: [{ name: "n" }],
          },
          {
            type: "number",
            render: NumberInput,
            outlets: [{ name: "n" }],
          },
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
            type: "gain",
            inlets: [{ name: "in" }, { name: "gain" }],
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
