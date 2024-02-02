export const fm = {
  nodes: [
    {
      id: "1706871232440:number",
      x: 95,
      y: 13,
      state: 220,
    },
    {
      id: "1706871237562:osc",
      x: 390,
      y: 63,
    },
    {
      id: "1706871243098:out",
      x: 585,
      y: 71,
    },
    {
      id: "1706908552539:number",
      x: 17,
      y: 143,
      state: 50,
    },
    {
      id: "1706908564545:number",
      x: 110,
      y: 263,
      state: 200,
    },
    {
      id: "1706908571311:gain",
      x: 290,
      y: 179,
    },
    {
      id: "1706908580651:osc",
      x: 170,
      y: 172,
    },
  ],
  connections: [
    ["1706871232440:number:n", "1706871237562:osc:frequency"],
    ["1706871237562:osc:~", "1706871243098:out:destination"],
    ["1706908564545:number:n", "1706908571311:gain:gain"],
    ["1706908552539:number:n", "1706908580651:osc:frequency"],
    ["1706908580651:osc:~", "1706908571311:gain:in"],
    ["1706908571311:gain:~", "1706871237562:osc:detune"],
  ],
};

export const hello = {
  nodes: [
    { id: "1706871232440:number", x: 120, y: 120, state: 220 },
    { id: "1706871237562:osc", x: 300, y: 150 },
    { id: "1706871243098:out", x: 450, y: 150 },
  ],
  connections: [
    ["1706871232440:number:n", "1706871237562:osc:frequency"],
    ["1706871237562:osc:~", "1706871243098:out:destination"],
  ],
};
