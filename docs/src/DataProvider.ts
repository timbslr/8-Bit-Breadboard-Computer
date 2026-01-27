import { parseJSONC } from "./Parser/JSONCParser.js";
import PartListFileParser from "./Parser/PartListFileParser.js";
import "./Extensions/MapExtension.js";

import Instruction from "./Instruction/Instruction.js";
import { ControlBit } from "./types/ControlBit.js";
import { InstructionParser } from "./Instruction/InstructionParser.js";
import { JSONInstruction } from "./Instruction/InstructionTypes.js";

const INSTRUCTION_FILE_PATH = "../resources/data/instructionData.jsonc";
const CONTROL_BITS_FILE_PATH = "./resources/data/controlBits.json";
const PARTS_LIST_FOLDER_PATH = "./resources/PartLists/";
const PARTS_LIST_FILES_PATH = "./resources/PartLists/files.json";

export default class DataProvider {
  private static jsonInstructions: JSONInstruction[];
  private static instructions: Instruction[];
  private static controlBits: ControlBit[];

  /**
   * @returns {Promise<Instruction[]>}
   */
  static async getInstructions(): Promise<Instruction[]> {
    if (!this.instructions) {
      const jsonInstructions: JSONInstruction[] = (await this.getObjectFromJSONFile(INSTRUCTION_FILE_PATH)).instructions;
      const instructionParser = new InstructionParser();
      this.instructions = instructionParser.parseJSONInstructions(jsonInstructions);
    }

    return this.instructions;
  }

  static async getControlBits(): Promise<ControlBit[]> {
    if (!this.controlBits) {
      this.controlBits = (await this.getObjectFromJSONFile(CONTROL_BITS_FILE_PATH)).controlBits;
    }

    return this.controlBits;
  }

  static async getPartListFromFile(filePath: string): Promise<Map<string, { quantity: number; originList?: Set<string> }>> {
    if (filePath === "ALL") {
      let contentMap: Map<string, { quantity: number; originList: Set<string> }> = new Map();
      const files: string[] = await this.getObjectFromJSONFile(PARTS_LIST_FILES_PATH);
      const promises = files.map(async (filePath) => {
        const fileSpecificMap = await PartListFileParser.getContentMapFromFile(PARTS_LIST_FOLDER_PATH + filePath);
        contentMap.concatPartMap(new Map(Array.from(fileSpecificMap, ([key, value]) => [key, { quantity: value, originList: new Set([filePath]) }])));
      });

      await Promise.all(promises); //wait until all Promises are resolved, which means that the contentMap is filled completely
      return contentMap;
    }

    const contentMapFromFile = await PartListFileParser.getContentMapFromFile(filePath);
    return new Map(Array.from(contentMapFromFile, ([key, value]) => [key, { quantity: value }])); //originList not necessary as it is the same for every entry
  }

  private static async getObjectFromJSONFile(filePath: string) {
    const response = await fetch(filePath);
    return parseJSONC(await response.text());
  }
}
