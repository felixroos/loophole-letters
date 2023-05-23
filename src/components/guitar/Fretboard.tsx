import { For } from "solid-js";
import { scaleLinear } from "d3-scale";

export function Fretboard() {
  const [w, h] = [100, 25];
  const strings = [0, 1, 2, 3, 4, 5];
  const frets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const thickness = 1;
  const x = scaleLinear()
    .domain([0, frets.length - 1])
    .range([0, w - thickness]);
  const y = scaleLinear()
    .domain([0, strings.length - 1])
    .range([0, h - thickness]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <g>
        <For each={frets}>
          {(i) => (
            <>
              <rect
                x={x(i)}
                y={0}
                width={thickness}
                height={y(strings.length - 1) + thickness}
                fill="darkgray"
              />
            </>
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
    </svg>
  );
}
