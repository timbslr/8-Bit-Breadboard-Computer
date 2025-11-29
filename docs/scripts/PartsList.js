import { Parser } from "./Parser.js";
import TableUtilProvider from "./TableUtilProvider.js";

export class PartsList extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");

    let contentMap = new Map();
    if (src === "ALL") {
      const response = await fetch("../resources/BOMs/files.json");
      const files = await response.json();
      for (const file of files) {
        const fileSpecificContentMap = await this.getContentMapFromFile("../resources/BOMs/" + file);
        contentMap = this.concatContentMaps(contentMap, fileSpecificContentMap);
      }
    } else {
      contentMap = await this.getContentMapFromFile(src);
    }

    const partsListHeader = document.createElement("h3");
    partsListHeader.textContent = "Parts List";
    this.appendChild(partsListHeader);

    const partsListTable = TableUtilProvider.createPartsListTable(contentMap);
    this.appendChild(partsListTable);
  }

  async getContentMapFromFile(src) {
    const response = await fetch(src);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-16le"); //EasyEDA exports BOMs as Microsoft-Excel-CSV-Files, which are encoded in utf-16le
    const text = decoder.decode(buffer);

    return Parser.parsePartsListFile(text.trim());
  }

  concatContentMaps(map1, map2) {
    for (const [partName, quantity] of map2) {
      const previousQuantity = map1.get(partName) || 0;
      map1.set(partName, previousQuantity + quantity);
    }

    return map1;
  }
}

customElements.define("parts-list", PartsList);
