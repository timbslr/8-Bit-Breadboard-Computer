import { Parser } from "./Parser.js";
import TableUtilProvider from "./TableUtilProvider.js";

export class PartsList extends HTMLElement {
  async connectedCallback() {
    const src = this.getAttribute("src");

    if (src === "ALL") {
      alert("ALL");
      return;
    }

    const response = await fetch(src);
    const buffer = await response.arrayBuffer();
    const decoder = new TextDecoder("utf-16le"); //EasyEDA exports BOMs as Microsoft-Excel-CSV-Files, which are encoded in utf-16le
    const text = decoder.decode(buffer);

    const contentMap = Parser.parsePartsListFile(text.trim());

    const partsListHeader = document.createElement("h3");
    partsListHeader.textContent = "Parts List";
    this.appendChild(partsListHeader);

    const partsListTable = TableUtilProvider.createPartsListTable(contentMap);
    this.appendChild(partsListTable);
  }
}

customElements.define("parts-list", PartsList);
