import { parseJSONC } from "./Parser/JSONCParser.js";
import BOMFileParser from "./Parser/BOMFileParser.js";
import "./MapExtension.js";
import PSEUDOInstruction from "./PSEUDOInstruction.js";
import REALInstruction from "./REALInstruction.js";
import Instruction from "./Instruction.js";

export default class DataProvider {
  static #instructions;
  static #controlBits;

  /**
   * @returns {Promise<Instruction[]>}
   */
  static async getInstructions(): Promise<Instruction[]> {
    if (!this.#instructions) {
      const jsonInstructions = (await this.#getObjectFromJSONFile("../resources/data/instructionData.jsonc"))
        .instructions;
      this.#instructions = jsonInstructions.map((jsonInstruction) => {
        if (jsonInstruction.type === "PSEUDO") {
          return new PSEUDOInstruction(jsonInstruction);
        }
        return new REALInstruction(jsonInstruction);
      });
    }

    return this.#instructions;
  }

  static async getControlBits() {
    if (!this.#controlBits) {
      this.#controlBits = (await this.#getObjectFromJSONFile("./resources/data/controlBits.json")).controlBits;
    }

    return this.#controlBits;
  }

  static async getBOMFromFile(filePath) {
    if (filePath === "ALL") {
      let contentMap = new Map();
      const files = await this.#getObjectFromJSONFile("./resources/BOMs/files.json");
      const promises = files.map(async (file) => {
        const fileSpecificMap = await BOMFileParser.getContentMapFromFile("./resources/BOMs/" + file);
        contentMap.concatBySum(fileSpecificMap);
      });

      await Promise.all(promises);
      return contentMap;
    }

    return await BOMFileParser.getContentMapFromFile(filePath);
  }

  static async #getObjectFromJSONFile(filePath) {
    const response = await fetch(filePath);
    return parseJSONC(await response.text());
  }
}
