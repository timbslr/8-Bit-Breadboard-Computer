import Formatter from "../Formatter.js";
import InstructionRepository from "../InstructionRepository.js";
import TableBuilder from "../TableBuilder.js";

async function fillOverviewTables() {
  const groupedInstructions = await InstructionRepository.getGrouped();

  let pseudoInstructions = [];

  //sort each group by indexInGroup and add to table
  for (const sameGroupInstructions of Object.values(groupedInstructions)) {
    sameGroupInstructions.sort((instr1, instr2) => instr1.getIndexInGroup() - instr2.getIndexInGroup()); //sort in ascending alphabetical order
    const group = sameGroupInstructions[0].getGroup();
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
    .textAlign(["center", "center", "left"])
    .id(`pseudo-instruction-table`)
    .build();
  placeholder.parentNode.insertBefore(table, placeholder);
  placeholder.remove();
}

async function createTableRows(instructions) {
  const pseudoInstructionsInGroup = [];
  const rows = [];
  for (const instruction of instructions) {
    if (instruction.isPSEUDO()) {
      pseudoInstructionsInGroup.push(instruction);
    }
    const mnemonic = instruction.getMnemonic();

    const mnemonicString = Formatter.decorateMnemonicWithLink(
      mnemonic,
      instruction.isPSEUDO() ? `*${mnemonic}` : mnemonic
    );

    const instructionString = Formatter.escapeHTML(
      Formatter.joinMnemonicWithOperands(mnemonic, instruction.getOperands())
    );

    const shortDescription = Formatter.escapeHTML(instruction.getShortDescription());

    const opcode = instruction.isPSEUDO() ? "-" : instruction.getOpcode();
    rows.push([opcode, mnemonicString, instructionString, shortDescription]);
  }

  return { rows, pseudoInstructionsInGroup };
}

async function createPseudoInstructionRows(pseudoInstructions) {
  const rows = [];
  for (const pseudoInstruction of pseudoInstructions) {
    const mnemonic = pseudoInstruction.getMnemonic();
    const mnemonicString = Formatter.decorateMnemonicWithLink(
      mnemonic,
      pseudoInstruction.isPSEUDO() ? `*${mnemonic}` : mnemonic
    );
    const instructionString = Formatter.escapeHTML(
      Formatter.joinMnemonicWithOperands(mnemonic, pseudoInstruction.getOperands())
    );
    const mappedInstructionString = await Formatter.joinAndDecorateMappedInstructionsWithLink(
      pseudoInstruction.getMappedInstructions()
    );

    rows.push([mnemonicString, instructionString, mappedInstructionString]);
  }

  return rows;
}

fillOverviewTables();
