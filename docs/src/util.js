export const REGISTER_LOOKUP = ["A", "B", "X", "TMP"];
export const LCDREGISTER_LOOKUP = ["CTRL", "DATA"];
export const REGISTER_REGEX = /(PC_L|PC_H|MAR_L|MAR_H|IR|BUF|SP_L|SP_H|A|F|TMP|B|X|7SD)/;

export async function getControlBits() {
  const response = await fetch("./resources/data/controlBits.json");
  const data = await response.json();
  return data.controlBits;
}
