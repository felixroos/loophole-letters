import asc from "assemblyscript/asc";

export async function compileAssemblyScript(
  code: string,
  files: { [name: string]: string }
) {
  const output = Object.create({
    stdout: asc.createMemoryStream(),
    stderr: asc.createMemoryStream(),
  });
  const sources: any = {
    "index.ts": code,
    ...(files || {}),
  };
  const { error } = await asc.main(
    ["--outFile", "binary", "--textFile", "text", "index.ts"],
    {
      stdout: output.stdout,
      stderr: output.stderr,
      readFile: (name: string) =>
        sources.hasOwnProperty(name) ? sources[name] : null,
      writeFile: (name: string, contents: string) => (output[name] = contents),
      listFiles: () => [],
    }
  );
  if (error) {
    const message = `${error.message}: ${output.stderr.toString()}`;
    throw new Error(message);
  }
  return output;
}
