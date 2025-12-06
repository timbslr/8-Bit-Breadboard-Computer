import DataProvider from "./DataProvider.js";
import TableFactory from "./TableFactory.js";

export class PartsList extends HTMLElement {
  async connectedCallback() {
    const srcPath = this.getAttribute("src");
    const partsListMap = await DataProvider.getBOMFromFile(srcPath);

    this.appendChild(this.getDescriptionHeader());

    const partsListTable = new TableFactory()
      .headers(["Quantity", "Part Name"])
      .addRows(Array.from(partsListMap.entries()).map(([partName, quantity]) => [quantity, partName]))
      .textAlign(["center", "left"])
      .build();

    this.appendChild(partsListTable);
  }

  getDescriptionHeader() {
    const descriptionHeader = document.createElement("h3");
    descriptionHeader.textContent = "Parts List";
    return descriptionHeader;
  }
}

customElements.define("parts-list", PartsList);
