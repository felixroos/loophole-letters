import { createSignal, onCleanup, onMount } from "solid-js";

export function Patcher() {
  const [showDialog, setShowDialog] = createSignal(false);
  const [nodes, setNodes] = createSignal([]);
  const [connections, setConnections] = createSignal([]);
  const [selectedNode, setSelectedNode] = createSignal();
  const [mouseDown, setMouseDown] = createSignal(false);
  const [activePort, setActivePort] = createSignal();
  const isPatching = () => !!activePort(); /*  && !mouseDown() */
  const [mousePosition, setMousePosition] = createSignal();
  const getNodeId = (node) => `${node.id}:${node.type}`;
  const getPortId = (node, port) => `${getNodeId(node)}:${port.name}`;
  let dragPos, nodeContainer;
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
      const [x1, y1] = getPortCenter(connection[0]);
      const [x2, y2] = getPortCenter(connection[1]);
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
  const handleMouseUp = (e) => {
    if (mouseDown()) {
      setTimeout(() => {
        setMouseDown(false);
        setActivePort();
      });
    }
  };
  const createNode = (node) => {
    const [x, y] = mousePosition();
    const id = Date.now();
    setNodes([...nodes(), { ...node, x, y, id }]);
    setShowDialog(false);
  };
  const deleteNode = (toDelete) => {
    setSelectedNode(); // unselect
    // unplug all connections from or to the node
    setConnections(
      connections().filter(
        (con) => !con.find((p) => p.startsWith(`${toDelete}:`))
      )
    );
    // delete node
    setNodes(nodes().filter((node) => node.id !== toDelete));
  };
  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && !!selectedNode()) {
      deleteNode(selectedNode());
    } else if (e.key === "Escape" && showDialog()) {
      setShowDialog(false);
    } else if (e.key === "Escape" && activePort()) {
      setActivePort();
      setSelectedNode();
    } else if (e.key === "Escape" && selectedNode()) {
      setSelectedNode();
    }
  };
  onMount(() => {
    document?.addEventListener("mouseup", handleMouseUp);
    document?.addEventListener("keydown", handleKeyDown);
  });
  onCleanup(() => {
    document?.removeEventListener("mouseup", handleMouseUp);
    document?.removeEventListener("keydown", handleKeyDown);
  });

  const activatePort = (id, isInlet) => {
    const connection = connections().find((con) => con.includes(id));
    if (isInlet && connection) {
      // break connection when already patched inlet is clicked
      setConnections(connections().filter((con) => !con.includes(id)));
      const nodeId = id.split(":")[0];
      const outPort = connection.find((p) => !p.startsWith(nodeId));
      outPort && setActivePort(outPort);
    } else {
      setActivePort(id);
    }
    setSelectedNode();
  };
  const connect = (a, b) => {
    setConnections(connections().concat([[a, b]]));
  };

  const handlePortMouseDown = (node, port, isInlet) => (e) => {
    const id = getPortId(node, port);
    if (activePort()) {
      connect(activePort(), id);
    } else {
      activatePort(id, isInlet);
    }
    setMouseDown(true);
    e.stopImmediatePropagation();
    e.stopPropagation();
  };
  const handlePortMouseUp = (node, port, isInlet) => (e) => {
    const from = activePort();
    const to = getPortId(node, port);
    if (from === to) {
      activatePort(from, isInlet);
    } else if (activePort()) {
      connect(from, to);
      setActivePort();
    }
    setMouseDown(false);
    e.stopImmediatePropagation();
    e.stopPropagation();
  };
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
                  onClick={() => createNode(node)}
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
        onMouseUp={(e) => {
          if (!mouseDown() && !isPatching() && e.target === e.currentTarget) {
            setShowDialog(true);
          }
        }}
        onMouseMove={(e) => {
          const [x, y] = getRelativeMousePosition(e, e.currentTarget);
          setMousePosition([x, y]);
          if (mouseDown() && selectedNode() && !isPatching()) {
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
            data-node={getNodeId(node)}
            onMouseDown={(e) => {
              const { offsetX, offsetY } = e;
              dragPos = [offsetX, offsetY];
              setMouseDown(true);
              setSelectedNode(node.id);
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div class="w-full text-center">{node.type}</div>
            <div class="flex space-x-4 text-xs">
              <div>
                {node.inlets?.map((port) => (
                  <div
                    class="flex items-center -mx-1.5 space-x-1 group"
                    onMouseUp={handlePortMouseUp(node, port)}
                    onMouseDown={handlePortMouseDown(node, port, true)}
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
        <div class="absolute">
          {mouseDown() && "MD"} {activePort()}{" "}
        </div>
      </div>
    </div>
  );
}
