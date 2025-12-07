import Formatter from "../Formatter.js";
import InstructionsUtilProvider from "../InstructionsUtilProvider.js";
import TableBuilder from "../TableBuilder.js";

async function fillOverviewTables() {
  const groupedInstructions = await InstructionsUtilProvider.getGroupedInstructionObjects();

  let pseudoInstructions = [];

  //sort each group by indexInGroup and add to table
  for (const sameGroupInstructions of Object.values(groupedInstructions)) {
    sameGroupInstructions.sort((instr1, instr2) => instr1.indexInGroup - instr2.indexInGroup); //sort in ascending alphabetical order
    const group = sameGroupInstructions[0].group;
    const { rows, pseudoInstructionsInGroup } = await createTableRows(sameGroupInstructions);

    const table = new TableBuilder()
      .headers(["OpCode", "Mnemonic", "Instruction", "Description"])
      .addRows(rows)
      .textAlign(["center", "center", "left", "left"])
      .id(`${group}-table`)
      .build();

    const placeholder = document.querySelector(`#placeholder-${group}-table`);
    placeholder.parentNode.insertBefore(table, placeholder);
    placeholder.remove();

    pseudoInstructions = pseudoInstructions.concat(pseudoInstructionsInGroup);
  }

  //addEntriesToTable("pseudo-instructions-table", pseudoInstructions, ["mnemonic", "instruction", "mappedInstructions"]);
  const placeholder = document.querySelector(`#placeholder-pseudo-instructions-table`);
  const pseudoInstructionRows = await createPseudoInstructionRows(pseudoInstructions);
  const table = new TableBuilder()
    .headers(["Mnemonic", "Instruction", "Mapped Instructions"])
    .addRows(pseudoInstructionRows)
    .id(`pseudo-instruction-table`)
    .build();
  placeholder.parentNode.insertBefore(table, placeholder);
  placeholder.remove();
}

async function createTableRows(entries) {
  const pseudoInstructionsInGroup = [];
  const rows = [];
  for (const entry of entries) {
    const isPSEUDO = await InstructionsUtilProvider.isPSEUDOInstruction(entry.mnemonic);
    if (isPSEUDO) {
      pseudoInstructionsInGroup.push(entry);
    }

    const mnemonicString = InstructionsUtilProvider.decorateMnemonicWithLink(
      entry.mnemonic,
      isPSEUDO ? `*${entry.mnemonic}` : entry.mnemonic
    );

    const instructionString = Formatter.escapeHTML(
      InstructionsUtilProvider.joinMnemonicWithOperands(entry.mnemonic, entry.operands)
    );

    const shortDescription = Formatter.escapeHTML(entry.shortDescription);

    const opcode = entry.opcode || "-";
    rows.push([opcode, mnemonicString, instructionString, shortDescription]);
  }

  return { rows, pseudoInstructionsInGroup };
}

async function createPseudoInstructionRows(pseudoInstructions) {
  const rows = [];
  for (const entry of pseudoInstructions) {
    const isPSEUDO = await InstructionsUtilProvider.isPSEUDOInstruction(entry.mnemonic);

    const mnemonicString = InstructionsUtilProvider.decorateMnemonicWithLink(
      entry.mnemonic,
      isPSEUDO ? `*${entry.mnemonic}` : entry.mnemonic
    );
    const instructionString = Formatter.escapeHTML(
      InstructionsUtilProvider.joinMnemonicWithOperands(entry.mnemonic, entry.operands)
    );
    const mappedInstructionString = await InstructionsUtilProvider.joinAndDecorateMappedInstructionsWithLink(
      entry.mappedInstructions
    );

    rows.push([mnemonicString, instructionString, mappedInstructionString]);
  }

  return rows;
}

fillOverviewTables();
