import ComponentComparator from "./Comparators/ComponentComparator.js";
import DataProvider from "./DataProvider.js";
import TableBuilder from "./TableBuilder.js";

export class PartsList extends HTMLElement {
  async connectedCallback() {
    const srcPath = this.getAttribute("src");
    const partsListMap = await DataProvider.getBOMFromFile(srcPath);

    this.appendChild(this.getDescriptionHeader());

    const partsListTable = new TableBuilder()
      .headers(["Quantity", "Part Name"])
      .addRows(Array.from(partsListMap.entries()).map(([partName, quantity]) => [quantity, partName]))
      .sortByColumn("Part Name", ComponentComparator.compare)
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
