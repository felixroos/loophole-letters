import { createEffect, onCleanup } from "solid-js";

export function Scope(props) {
  let canvas, frame, analyserData;

  function start() {
    frame = requestAnimationFrame(function draw() {
      if (canvas && props.analyser) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyserData =
          analyserData || new Float32Array(props.analyser.frequencyBinCount);
        drawTimeScope(ctx, props.analyser, analyserData, props.options || {});
      }
      frame = requestAnimationFrame(draw);
    });
  }
  function stop() {
    frame && cancelAnimationFrame(frame);
  }
  onCleanup(() => stop());
  createEffect(() => {
    if (props.analyser) {
      start();
    } else {
      stop();
    }
  });
  return <canvas ref={canvas} width={700} height={100} />;
}

export function drawTimeScope(
  ctx,
  analyser,
  analyserData,

  {
    align = true,
    color = "black",
    thickness = 2,
    scale = 1,
    pos = 0.5,
    next = 1,
    trigger = 0,
  } = {}
) {
  analyser.getFloatTimeDomainData(analyserData);

  ctx.lineWidth = thickness;
  ctx.strokeStyle = color;

  ctx.beginPath();
  let canvas = ctx.canvas;

  const bufferSize = analyser.frequencyBinCount;
  let triggerIndex = align
    ? Array.from(analyserData).findIndex(
        (v, i, arr) => i && arr[i - 1] > -trigger && v <= -trigger
      )
    : 0;
  triggerIndex = Math.max(triggerIndex, 0); // fallback to 0 when no trigger is found

  const sliceWidth = (canvas.width * 1.0) / bufferSize;
  let x = 0;

  for (let i = triggerIndex; i < bufferSize; i++) {
    const v = analyserData[i];
    const y = canvas.height * (1 - (pos + scale * v));

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  }
  ctx.stroke();
}
