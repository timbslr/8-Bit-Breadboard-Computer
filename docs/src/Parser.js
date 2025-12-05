export class Parser {
  static parsePartsListFile(text) {
    const map = new Map();

    //remove the first line which is the header
    for (const line of text.split("\n").slice(1)) {
      const content = line.split("\t");
      const quantity = Number(content[0]);
      const partName = content[1];
      map.set(partName, quantity);
    }

    return map;
  }
}
