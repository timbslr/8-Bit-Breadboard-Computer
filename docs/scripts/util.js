export const REGISTER_LOOKUP = ["A", "B", "X", "T"];
export const LCDREGISTER_LOOKUP = ["CTRL", "DATA"];

export async function getControlBits() {
  const response = await fetch("./resources/data/controlBits.json");
  const data = await response.json();
  return data.controlBits;
}

export function escapeHTML(string) {
  return string.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
}
