export default class Formatter {
  static formatNumberOfClockCyclesString(numberOfClockCyclesObject) {
    const clockCycles = numberOfClockCyclesObject;
    if (clockCycles.flagLow > clockCycles.flagHigh) {
      //the smaller clock cycle count should be displayed first, followed by the bigger one if they are not equal
      [clockCycles.flagLow, clockCycles.flagHigh] = [clockCycles.flagHigh, clockCycles.flagLow];
    }

    return clockCycles.flagLow === clockCycles.flagHigh
      ? clockCycles.flagLow
      : `${clockCycles.flagLow}/${clockCycles.flagHigh}`;
  }

  static formatClobberedRegisters(clobberedRegisters) {
    const formattedString = [...clobberedRegisters].map((entry) => Formatter.escapeHTML(entry)).join(",<br>");
    return formattedString === "" ? "-" : formattedString;
  }

  static escapeHTML(string) {
    return string.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
  }
}
