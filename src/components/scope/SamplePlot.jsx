import { Waveform } from "./Waveform";

export function SamplePlot(props) {
  const samples = () =>
    eval(`
  ${props.code}
  const sr = 44100;
  Array.from({ length: sr * ${props.seconds || 0.5} }, (_, t) => dsp(t / sr))
  `);
  return (
    <div class="max-w-full overflow-auto">
      <Waveform width={700} samples={samples()} options={props.options} />
    </div>
  );
}
