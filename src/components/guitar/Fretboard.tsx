import { For } from "solid-js";
import { scaleLinear } from "d3-scale";

export function Fretboard() {
  const [w, h] = [200, 50];
  const strings = [0, 1, 2, 3, 4, 5];
  const stringNotes = ["E2", "A2", "D3", "G3", "B3", "E4"];
  const frets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const thickness = 1;
  const py = 2;
  const pl = 8;
  const x = scaleLinear()
    .domain([0, frets.length - 1])
    .range([pl, w - thickness]);
  const y = scaleLinear()
    .domain([0, strings.length - 1])
    .range([py, h - thickness - py]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <g>
        <For each={frets}>
          {(i) => (
            <rect
              x={x(i)}
              y={y(0)}
              width={thickness}
              height={y(strings.length - 1) + thickness - py}
              fill="darkgray"
            />
          )}
        </For>
      </g>
      <g>
        <For each={strings}>
          {(i) => (
            <rect
              x={x(0)}
              y={y(i)}
              width={x(frets.length - 1) + thickness}
              height={thickness}
              fill="steelblue"
            />
          )}
        </For>
      </g>
      <g>
        <g>
          <For each={strings}>
            {(i) => (
              <text x={0} y={y(i) + 2} font-size=".25em">
                {stringNotes[strings.length - i - 1]}
              </text>
            )}
          </For>
        </g>
        <For each={frets}>
          {(i) => (
            <For each={strings}>
              {(j) => (
                <text
                  x={x(i) + 4}
                  y={y(j) + 2}
                  font-size=".25em"
                  style={{ "z-index": 10 }}
                >
                  {stringNotes[strings.length - j - 1]}
                </text>
              )}
            </For>
          )}
        </For>
      </g>
    </svg>
  );
}
