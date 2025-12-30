import Formatter from "../Formatter.js";
import InstructionRepository from "../InstructionRepository.js";
import REALInstruction from "../REALInstruction.js";
import TableBuilder from "../TableBuilder.js";

async function createAndFillTables() {
  const sortedInstructions = await InstructionRepository.getSorted();
  for (const instruction of sortedInstructions) {
    const mnemonic = instruction.getMnemonic();
    const opcode = instruction.isPSEUDO() ? "-" : (instruction as REALInstruction).getOpcode();
    const clobberedRegisters = Formatter.formatClobberedRegisters(await instruction.getClobberedRegisters());

    const sizeInROM = await instruction.getByteSizeInROM();
    let sizeInROMString = `${sizeInROM} Byte`;
    if (sizeInROM !== 1) {
      sizeInROMString += "s"; //s for Bytes
    }

    const numberOfClockCycles = await instruction.getAmountOfClockCyclesPerExecution();
    const numberOfClockCyclesString = Formatter.formatNumberOfClockCyclesString(numberOfClockCycles);

    const table = new TableBuilder()
      .headers(["Instruction Type", "Group", "Opcode", "Clobbered Registers", "Size in ROM", "Number of Clock Cycles"])
      .addRow([
        instruction.isPSEUDO() ? "PSEUDO" : "REAL",
        instruction.getGroup(),
        opcode,
        clobberedRegisters,
        sizeInROMString,
        numberOfClockCyclesString,
      ])
      .textAlign(["center", "center", "center", "center", "center", "center"])
      .id(`${mnemonic}-table`)
      .build();

    const mainContent = document.getElementById("main-content") as HTMLElement; //the section for the pages main content

    const instructionSection = document.createElement("div");

    const tableDescriptionHeader = document.createElement("h4");
    tableDescriptionHeader.id = mnemonic;
    tableDescriptionHeader.innerHTML = `${mnemonic} &ndash; ${instruction.getName()}`;
    instructionSection.appendChild(tableDescriptionHeader);

    instructionSection.appendChild(table);
    const lineBreak = document.createElement("br");
    instructionSection.appendChild(lineBreak);

    mainContent.appendChild(instructionSection);
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
