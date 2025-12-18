import { parseJSONC } from "./Parser/JSONCParser.js";
import PartListFileParser from "./Parser/PartListFileParser.js";
import "./MapExtension.js";

import PSEUDOInstruction from "./PSEUDOInstruction.js";
import REALInstruction from "./REALInstruction.js";
import Instruction from "./Instruction.js";
import { ControlBit } from "./types/ControlBit.js";
import { JSONInstruction } from "./types/InstructionTypes.js";

const INSTRUCTION_FILE_PATH = "../resources/data/instructionData.jsonc";
const CONTROL_BITS_FILE_PATH = "./resources/data/controlBits.json";
const PARTS_LIST_FOLDER_PATH = "./resources/PartLists/";
const PARTS_LIST_FILES_PATH = "./resources/PartLists/files.json";

export default class DataProvider {
  private static instructions: Instruction[];
  private static controlBits: ControlBit[];

  /**
   * @returns {Promise<Instruction[]>}
   */
  static async getInstructions(): Promise<Instruction[]> {
    if (!this.instructions) {
      const jsonInstructions: JSONInstruction[] = (await this.getObjectFromJSONFile(INSTRUCTION_FILE_PATH)).instructions;
      this.instructions = jsonInstructions.map((jsonInstruction) => {
        if (jsonInstruction.type === "PSEUDO") {
          return new PSEUDOInstruction(jsonInstruction);
        }
        return new REALInstruction(jsonInstruction);
      });
    }

    return this.instructions;
  }

  static async getControlBits(): Promise<ControlBit[]> {
    if (!this.controlBits) {
      this.controlBits = (await this.getObjectFromJSONFile(CONTROL_BITS_FILE_PATH)).controlBits;
    }

    return this.controlBits;
  }

  static async getPartListFromFile(filePath: string): Promise<Map<string, number>> {
    if (filePath === "ALL") {
      let contentMap = new Map();
      const files: string[] = await this.getObjectFromJSONFile(PARTS_LIST_FILES_PATH);
      const promises = files.map(async (filePath) => {
        const fileSpecificMap = await PartListFileParser.getContentMapFromFile(PARTS_LIST_FOLDER_PATH + filePath);
        contentMap.concatBySum(fileSpecificMap);
      });

      await Promise.all(promises); //wait until all Promises are resolved, which means that the contentMap is filled completely
      return contentMap;
    }

    return await PartListFileParser.getContentMapFromFile(filePath);
  }

  private static async getObjectFromJSONFile(filePath: string) {
    const response = await fetch(filePath);
    return parseJSONC(await response.text());
  }
}
