import { parseJSONC } from "./Parser/JSONCParser.js";
import BOMFileParser from "./Parser/BOMFileParser.js";
import "./MapExtension.js";
import PSEUDOInstruction from "./PSEUDOInstruction.js";
import REALInstruction from "./REALInstruction.js";
import Instruction from "./Instruction.js";
import { ControlBit } from "./types/ControlBit.js";
import { JSONInstruction } from "./types/InstructionTypes.js";

export default class DataProvider {
  private static instructions: Instruction[];
  private static controlBits: ControlBit[];

  /**
   * @returns {Promise<Instruction[]>}
   */
  static async getInstructions(): Promise<Instruction[]> {
    if (!this.instructions) {
      const jsonInstructions: JSONInstruction[] = (
        await this.getObjectFromJSONFile("../resources/data/instructionData.jsonc")
      ).instructions;
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
      this.controlBits = (await this.getObjectFromJSONFile("./resources/data/controlBits.json")).controlBits;
    }

    return this.controlBits;
  }

  static async getBOMFromFile(filePath: string) {
    if (filePath === "ALL") {
      let contentMap = new Map();
      const files: string[] = await this.getObjectFromJSONFile("./resources/BOMs/files.json");
      const promises = files.map(async (file) => {
        const fileSpecificMap = await BOMFileParser.getContentMapFromFile("./resources/BOMs/" + file);
        contentMap.concatBySum(fileSpecificMap);
      });

      await Promise.all(promises);
      return contentMap;
    }

    return await BOMFileParser.getContentMapFromFile(filePath);
  }

  private static async getObjectFromJSONFile(filePath: string) {
    const response = await fetch(filePath);
    return parseJSONC(await response.text());
  }
}
