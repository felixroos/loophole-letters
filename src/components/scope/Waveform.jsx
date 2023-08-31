import { createEffect } from "solid-js";

export function Waveform(props) {
  let canvas;
  createEffect(() => {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWaveform(ctx, props.samples, props.options);
  });
  return <canvas ref={canvas} width={700} height={100} />;
}

export function drawWaveform(ctx, samples = [], options = {}) {
  const { thickness, color, align = 0, scale = 1, pos = 0.5 } = options;
  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;

  ctx.beginPath();
  let canvas = ctx.canvas;

  const bufferSize = samples.length;
  let triggerIndex = align
    ? Array.from(samples).findIndex(
        (v, i, arr) => i && arr[i - 1] > -trigger && v <= -trigger
      )
    : 0;
  triggerIndex = Math.max(triggerIndex, 0); // fallback to 0 when no trigger is found

  const sliceWidth = (canvas.width * 1.0) / bufferSize;
  let x = 0;

  for (let i = triggerIndex; i < bufferSize; i++) {
    const v = samples[i] + 1;
    const y = (scale * (v - 1) + pos) * canvas.height;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
}
