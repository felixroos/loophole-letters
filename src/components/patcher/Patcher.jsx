import { createSignal, onCleanup, onMount } from "solid-js";

export function Patcher() {
  const [showDialog, setShowDialog] = createSignal(false);
  const [nodes, setNodes] = createSignal([]);
  const [selectedNode, setSelectedNode] = createSignal();
  const [patching, setPatching] = createSignal(false);
  const [mouseDown, setMouseDown] = createSignal(false);
  let pos, dragPos, nodeContainer;
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
    });
  };
  onMount(() => document?.addEventListener("mouseup", handleMouseUp));
  onCleanup(() => document?.removeEventListener("mouseup", handleMouseUp));
  const handlePortMouseUp = (e) => {
    console.log("port mouse up.. connect");
    e.stopPropagation();
  };
  const handlePortMouseDown = (e) => {
    // console.log("port mouse down");
    e.stopPropagation();
    setMouseDown(true);
    setPatching(true);
  };
  const handlePortClick = (e) => e.stopPropagation();

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
          const w = el.clientWidth;
          nodeContainer = el;
        }}
        onClick={(e) => {
          if (!mouseDown() && !patching() && e.target === nodeContainer) {
            const { offsetX, offsetY } = e;
            pos = [offsetX, offsetY];
            setShowDialog(true);
          }
        }}
        onMouseMove={(e) => {
          if (mouseDown() && selectedNode() && !patching()) {
            const { x, y } = nodeContainer.getBoundingClientRect();
            const { clientX, clientY } = e;
            const [offsetX, offsetY] = [clientX - x, clientY - y];
            e.stopPropagation();
            setNodes(
              nodes().map((node) =>
                node.id === selectedNode()
                  ? {
                      ...node,
                      x: offsetX - dragPos[0],
                      y: offsetY - dragPos[1],
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
            class={`node bg-white absolute border-2 ${
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
            {node.type}
            <div class="flex space-x-4 text-xs">
              <div>
                {node.inlets?.map((port) => (
                  <div
                    class="flex items-center -mx-1.5 space-x-1 group"
                    onMouseUp={handlePortMouseUp}
                    onMouseDown={handlePortMouseDown}
                    onClick={handlePortClick}
                  >
                    <div class="w-3 h-3 bg-yellow-500 group-hover:bg-red-500" />
                    <div>{port.name}</div>
                  </div>
                ))}
              </div>
              <div>
                {node.outlets?.map((port) => (
                  <div
                    class="flex items-center -mx-1.5 space-x-1 group"
                    onMouseUp={handlePortMouseUp}
                    onMouseDown={handlePortMouseDown}
                    onClick={handlePortClick}
                  >
                    <div>{port.name}</div>
                    <div class="w-3 h-3 bg-yellow-500 group-hover:bg-red-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
