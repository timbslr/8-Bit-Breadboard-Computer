import ComponentComparator from "./Comparators/ComponentComparator.js";
import DataProvider from "./DataProvider.js";
import TableBuilder from "./TableBuilder.js";

export class PartList extends HTMLElement {
  async connectedCallback() {
    const srcPath = this.getAttribute("src");
    if (!srcPath) {
      throw new TypeError("SourcePath of PartList must be specified!");
    }

    const partListMap = await DataProvider.getPartListFromFile(srcPath);

    this.appendChild(this.getDescriptionHeader());

    const partListTable = new TableBuilder()
      .headers(["Quantity", "Part Name"])
      .addRows(Array.from(partListMap.entries()).map(([partName, quantity]) => [String(quantity), partName]))
      .sortByColumn("Part Name", ComponentComparator.compare)
      .textAlign(["center", "left"])
      .build();

    this.appendChild(partListTable);
  }

  getDescriptionHeader() {
    const descriptionHeader = document.createElement("h3");
    descriptionHeader.textContent = "Parts List";
    return descriptionHeader;
  }
}

customElements.define("part-list", PartList);
