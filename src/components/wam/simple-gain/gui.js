export async function createElement(plugin) {
  const div = document.createElement("div");
  div.textContent = `WebAudioModule[${plugin.name}]`;
  return div;
}
