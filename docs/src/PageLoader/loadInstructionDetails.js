import Formatter from "../Formatter.js";
import InstructionsUtilProvider from "../InstructionsUtilProvider.js";
import Statistics from "../Statistics.js";
import TableFactory from "../TableFactory.js";

async function createAndFillTables() {
  const sortedInstructions = await InstructionsUtilProvider.getSortedInstructionObjectsByMnemonic(); //sort in ascending alphabetical order

  for (const instruction of sortedInstructions) {
    const mnemonic = instruction.mnemonic;
    const opcode = instruction.opcode || "-";
    const clobberedRegisters = Formatter.formatClobberedRegisters(
      await InstructionsUtilProvider.getClobberedRegisters(instruction)
    );

    const sizeInROM = await Statistics.getByteSizeInROM(mnemonic);
    let sizeInROMString = `${sizeInROM} Byte`;
    if (sizeInROM !== 1) {
      sizeInROMString += "s"; //s for Bytes
    }

    const numberOfClockCycles = await Statistics.getAmountOfClockCyclesPerExecution(mnemonic);
    const numberOfClockCyclesString = Formatter.formatNumberOfClockCyclesString(numberOfClockCycles);

    const table = new TableFactory()
      .headers(["Instruction Type", "Group", "Opcode", "Clobbered Registers", "Size in ROM", "Number of Clock Cycles"])
      .addRow([
        instruction.type,
        instruction.group,
        opcode,
        clobberedRegisters,
        sizeInROMString,
        numberOfClockCyclesString,
      ])
      .textAlign(["center", "center", "center", "center", "center", "center"])
      .id(`${mnemonic}-table`)
      .build();

    const mainContent = document.getElementById("main-content"); //the section for the pages main content

    const tableDescription = document.createElement("h4");
    tableDescription.id = mnemonic;
    tableDescription.innerHTML = `${mnemonic} &ndash; ${instruction.name}`;
    mainContent.appendChild(tableDescription);

    const lineBreak = document.createElement("br");
    mainContent.appendChild(lineBreak);
    mainContent.appendChild(table, lineBreak.nextSibling);
  }

  scrollToHeaderIfNecessary(); //scroll header into view if the url contains a hash linking to it
}

function scrollToHeaderIfNecessary() {
  const headerLinkFromURL = window.location.hash;
  if (!headerLinkFromURL) return;

  const headerId = headerLinkFromURL.replace("#", "");
  const targetHeader = document.getElementById(headerId);
  if (!targetHeader) return;

  targetHeader.scrollIntoView({ behavior: "instant" });

  //highlight header for 1 second
  targetHeader.classList.add("highlightedHeader");
  setTimeout(() => {
    targetHeader.classList.remove("highlightedHeader");
  }, 1000);
}

createAndFillTables();
window.addEventListener("hashchange", scrollToHeaderIfNecessary); //if the hash linking to a header changed
