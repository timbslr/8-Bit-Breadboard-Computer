const BOMFileParser = {
  parsePartsListFile(text) {
    const map = new Map();

    //remove the first line which is the header
    for (const line of text.split("\n").slice(1)) {
      const content = line.split("\t");
      const quantity = Number(content[0]);
      const partName = content[1];
      map.set(partName, quantity);
    }

    return map;
  },
  async getContentMapFromFile(srcPath) {
    const response = await fetch(srcPath);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-16le"); //EasyEDA exports BOMs as Microsoft-Excel-CSV-Files, which are encoded in utf-16le
    const text = decoder.decode(buffer);

    return BOMFileParser.parsePartsListFile(text.trim());
  },
};

export default BOMFileParser;
