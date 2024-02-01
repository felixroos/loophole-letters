import { createSignal, onCleanup, onMount } from "solid-js";

export function Patcher() {
  const [showDialog, setShowDialog] = createSignal(false);
  const [nodes, setNodes] = createSignal([]);
  const [connections, setConnections] = createSignal([]);
  const [selectedNode, setSelectedNode] = createSignal();
  const [patching, setPatching] = createSignal(false);
  const [mouseDown, setMouseDown] = createSignal(false);
  const [activePort, setActivePort] = createSignal();
  const [mousePosition, setMousePosition] = createSignal();
  const getPortId = (node, port) => `${node.id}:${node.type}:${port.name}`;
  let pos, dragPos, nodeContainer;
  const getPortCenter = (portId) => {
    const el = nodeContainer.querySelector(`[data-port="${portId}"]`);
    const { x: xa, y: ya, width, height } = el.getBoundingClientRect();
    const { x: xo, y: yo } = nodeContainer.getBoundingClientRect();
    return [xa - xo + width / 2, ya - yo + height / 2];
  };
  const cables = () => {
    let _cables = [];
    if (activePort() && mousePosition()) {
      const [x1, y1] = getPortCenter(activePort());
      const [x2, y2] = mousePosition();
      _cables.push([x1, y1, x2, y2]);
    }
    nodes(); // call to update
    connections().forEach((connection) => {
      const [x1, y1] = getPortCenter(connection.from);
      const [x2, y2] = getPortCenter(connection.to);
      _cables.push([x1, y1, x2, y2]);
    });
    return _cables;
  };
  const nodeTypes = [
    {
      type: "sine",
      inlets: [{ name: "freq" }, { name: "sync" }],
      outlets: [{ name: "out" }],
    },
    {
      type: "add",
      inlets: [{ name: "in0" }, { name: "in1" }],
      outlets: [{ name: "out" }],
    },
    {
      type: "out",
      inlets: [{ name: "left" }, { name: "right" }],
    },
  ];
  const handleMouseUp = () => {
    setMouseDown(false);
    setTimeout(() => {
      setPatching(false);
      setActivePort();
    });
  };
  onMount(() => document?.addEventListener("mouseup", handleMouseUp));
  onCleanup(() => document?.removeEventListener("mouseup", handleMouseUp));
  let toPatch;
  const handlePortMouseUp = (node, port) => (e) => {
    const from = getPortId(toPatch[0], toPatch[1]);
    const to = getPortId(node, port);
    // console.log("connect", `${from} -> ${to}`);
    setConnections(connections().concat([{ from, to }]));
    e.stopPropagation();
  };
  const handlePortMouseDown = (node, port) => (e) => {
    setActivePort(getPortId(node, port));
    toPatch = [node, port];
    e.stopPropagation();
    setMouseDown(true);
    setPatching(true);
  };
  const handlePortClick = (e) => e.stopPropagation();
  const getRelativeMousePosition = (e, el) => {
    const { x, y } = el.getBoundingClientRect();
    const { clientX, clientY } = e;
    return [clientX - x, clientY - y];
  };

  return (
    <div class="relative bg-slate-400 w-full h-[200px] not-prose select-none font-sans">
      {/* dialog */}
      {showDialog() && (
        <div
          class="absolute w-full h-full z-10 bg-[#00000010] p-4 flex justify-center"
          onClick={() => setShowDialog(false)}
        >
          <div
            class="w-64 bg-slate-200 p-2 border-2 border-slate-900 flex-col space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="flex justify-center">
              <h2>Create Node</h2>
            </div>
            <div class="grid grid-cols-2 gap-1">
              {nodeTypes.map((node) => (
                <div
                  class="cursor-pointer border-2 border-slate-900 text-center"
                  onClick={() => {
                    const [x, y] = pos;
                    const id = Date.now();
                    setNodes([...nodes(), { ...node, x, y, id }]);
                    setShowDialog(false);
                  }}
                >
                  {node.type}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* node container */}
      <div
        class="w-full h-full relative"
        ref={(el) => {
          nodeContainer = el;
        }}
        onClick={(e) => {
          if (!mouseDown() && !patching() && e.target === e.currentTarget) {
            const { offsetX, offsetY } = e;
            pos = [offsetX, offsetY];
            setShowDialog(true);
          }
        }}
        onMouseMove={(e) => {
          const [x, y] = getRelativeMousePosition(e, e.currentTarget);
          setMousePosition([x, y]);
          if (mouseDown() && selectedNode() && !patching()) {
            e.stopPropagation();
            setNodes(
              nodes().map((node) =>
                node.id === selectedNode()
                  ? {
                      ...node,
                      x: x - dragPos[0],
                      y: y - dragPos[1],
                    }
                  : node
              )
            );
          }
        }}
      >
        {nodes().map((node) => (
          <div
            style={`left: ${node.x}px; top: ${node.y}px`}
            class={`bg-white absolute border-2 ${
              selectedNode() === node.id ? "border-red-500" : "border-slate-900"
            }`}
            onMouseDown={(e) => {
              const { offsetX, offsetY } = e;
              dragPos = [offsetX, offsetY];
              setMouseDown(true);
              setSelectedNode(node.id);
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log("click node");
            }}
          >
            <div class="w-full text-center">{node.type}</div>
            <div class="flex space-x-4 text-xs">
              <div>
                {node.inlets?.map((port) => (
                  <div
                    class="flex items-center -mx-1.5 space-x-1 group"
                    onMouseUp={handlePortMouseUp(node, port)}
                    onMouseDown={handlePortMouseDown(node, port)}
                    onClick={handlePortClick}
                  >
                    <div
                      data-port={getPortId(node, port)}
                      class="port w-3 h-3 bg-yellow-500 group-hover:bg-red-500"
                    />
                    <div>{port.name}</div>
                  </div>
                ))}
              </div>
              <div>
                {node.outlets?.map((port) => (
                  <div
                    class="flex items-center -mx-1.5 space-x-1 group"
                    onMouseUp={handlePortMouseUp(node, port)}
                    onMouseDown={handlePortMouseDown(node, port)}
                    onClick={handlePortClick}
                  >
                    <div>{port.name}</div>
                    <div
                      data-port={getPortId(node, port)}
                      class="port w-3 h-3 bg-yellow-500 group-hover:bg-red-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <svg class="w-full h-full pointer-events-none z-[1000]">
          {cables().map(([x1, y1, x2, y2]) => (
            <line
              {...{ x1, y1, x2, y2 }}
              style="stroke: black; stroke-width: 2;"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
