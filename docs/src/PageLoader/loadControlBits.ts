import TableBuilder from "../TableBuilder.js";
import Formatter from "../Formatter.js";
import DataProvider from "../DataProvider.js";
import { ControlBit } from "../types/ControlBit.js";

async function createAndFillTables() {
  const controlBits = await DataProvider.getControlBits();
  const groupedControlBits = Object.groupBy(controlBits, (controlBits) => controlBits.associatedModule); //group by associated module
  const mainContent = document.getElementById("main-content") as HTMLElement;

  Object.entries(groupedControlBits).forEach(([groupName, controlBits]) => {
    const table = new TableBuilder()
      .headers(["Abbreviation", "Name", "s/a", "Description"])
      .addRows(createTableRowsFromControlBits(controlBits as ControlBit[]))
      .textAlign(["left", "left", "center", "left"])
      .id(`${groupName}-table`)
      .build();

    const tableDescription = document.createElement("h2");
    tableDescription.textContent = groupName;
    mainContent.appendChild(tableDescription);

    mainContent.appendChild(table);
  });
}

function createTableRowsFromControlBits(controlBits: ControlBit[]) {
  const rows: string[][] = [];
  controlBits.forEach((controlBit) => {
    const abbreviation = controlBit.isActiveHigh ? controlBit.abbreviation : Formatter.appendHTMLBar(controlBit.abbreviation);
    const synchronousCellContent = controlBit.isSynchronous ? "s" : "a";
    rows.push([abbreviation, controlBit.name, synchronousCellContent, controlBit.description]);
  });

  return rows;
}

createAndFillTables();
