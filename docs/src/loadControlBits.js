import { getControlBits } from "./util.js";
import { TableFactory } from "./TableFactory.js";
import Formatter from "./Formatter.js";

async function createAndFillTables() {
  let controlBits = await getControlBits();
  controlBits = Object.groupBy(controlBits, (controlBits) => controlBits.associatedModule); //group by associated module
  const mainContent = document.getElementById("main-content");

  Object.entries(controlBits).forEach(([groupName, moduleProperties]) => {
    const table = new TableFactory()
      .headers(["Abbreviation", "Name", "s/a", "Description"])
      .addRows(createTableRowsFromProperties(moduleProperties))
      .textAlign(["left", "left", "center", "left"])
      .id(`${groupName}-table`)
      .build();

    const tableDescription = document.createElement("h2");
    tableDescription.innerHTML = groupName;
    mainContent.appendChild(tableDescription);

    mainContent.appendChild(table);
  });
}

function createTableRowsFromProperties(moduleProperties) {
  const rows = [];
  moduleProperties.forEach((controlBit) => {
    const abbreviation = controlBit.isActiveHigh
      ? controlBit.abbreviation
      : Formatter.appendHTMLBar(controlBit.abbreviation);
    const synchronousCellContent = controlBit.isSynchronous ? "s" : "a";
    rows.push([abbreviation, controlBit.name, synchronousCellContent, controlBit.description]);
  });

  return rows;
}

createAndFillTables();
