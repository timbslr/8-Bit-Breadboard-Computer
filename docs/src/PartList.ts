import ComponentComparator from "./Comparators/ComponentComparator.js";
import DataProvider from "./DataProvider.js";
import Formatter from "./Formatter.js";
import TableBuilder, { TextAlignment } from "./TableBuilder.js";

export class PartList extends HTMLElement {
  async connectedCallback() {
    const srcPath = this.getAttribute("src");
    if (!srcPath) {
      throw new TypeError("SourcePath of PartList must be specified!");
    }

    const partListMap = await DataProvider.getPartListFromFile(srcPath);

    this.appendChild(this.getDescriptionHeader());

    const mappingFunction = ([partName, { quantity, originList }]: [string, { quantity: number; originList?: Set<string> }]) => {
      if (originList) {
        return [String(quantity), partName, Formatter.formatOriginListWithLinks(originList)];
      }
      return [String(quantity), partName];
    };

    let rows = Array.from(partListMap.entries()).map(mappingFunction);
    const isOriginListPresent = (rows.at(0)?.length ?? 0) > 2;

    const headers = ["Quantity", "Part Name"];
    const textAlignments: TextAlignment[] = ["center", "left"];
    if (isOriginListPresent) {
      headers.push("Origins");
      textAlignments.push("left");
    }

    const partListTable = new TableBuilder()
      .headers(headers)
      .addRows(rows)
      .sortByColumn("Part Name", new ComponentComparator())
      .textAlign(textAlignments)
      .id("part-list-table")
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
