#include <cstdint>
#include <iostream>
#include <fstream>
#include "../lib/json.hpp"
#include <vector>
#include <bitset>

using json = nlohmann::json;

const int EEPROM_SIZE = 8192; // Size of the EEPROM in bytes

uint32_t instructions[2][256][16] = {};  // initialize everything with zero
// 2 = Flag Bit (0 or 1)
// 256 = amount of opcodes (0x00 - 0xFF)
// 16 = amount of microsteps (0 - 15)


//  |                                CTRL1                                 |                            CTRL2                               |                                         CTRL3                               |                                    CTRL4
//  |    msb                                                         lsb   |    msb                                               lsb       |   msb                                                                 lsb   |   msb                                                               lsb  |      
//  |    7         6         5         4         3         2     1     0   |     7        6      5      4      3      2       1       0     |    7         6          5          4         3        2        1       0    |    7         6         5         4        3        2         1       0   |
//  |   RSC     IE_MUX_D  IE_MUX_C  IE_MUX_B  IE_MUX_A                     |            INC_PC  #IE_F         IE_X  LCD_RS  LCD_E  LCD_RW   | #MEM_WE  ALU_BOP_2  ALU_BOP_1  ALU_BOP_0  ALU_SRC  ALU_CIN  ALU_AOP         | OE_MUX_D  OE_MUX_C  OE_MUX_B  OE_MUX_A          #MEM_EN_IO  INC_X  DEC_X |
const uint32_t defaultPattern = 0b00000000'00100000'10000000'00000100;

const uint32_t RSC         = 0b10000000'00000000'00000000'00000000;
const uint32_t IE_T        = 0b00100000'00000000'00000000'00000000;
const uint32_t IE_PC_L     = 0b00101000'00000000'00000000'00000000;
const uint32_t IE_7SD      = 0b00110000'00000000'00000000'00000000;
const uint32_t IE_SP_L     = 0b00111000'00000000'00000000'00000000;
const uint32_t IE_SP_H     = 0b01000000'00000000'00000000'00000000;
const uint32_t IE_PC_H     = 0b01001000'00000000'00000000'00000000;
const uint32_t IE_MAR_H    = 0b01010000'00000000'00000000'00000000;
const uint32_t IE_IR       = 0b01011000'00000000'00000000'00000000;
const uint32_t IE_BUF      = 0b01100000'00000000'00000000'00000000;
const uint32_t IE_A        = 0b01101000'00000000'00000000'00000000;
const uint32_t IE_MAR_L    = 0b01110000'00000000'00000000'00000000;
const uint32_t IE_B        = 0b01111000'00000000'00000000'00000000;

const uint32_t INC_PC      = 0b00000000'01000000'00000000'00000000;
const uint32_t IE_F        = 0b00000000'00100000'00000000'00000000;
const uint32_t IE_X        = 0b00000000'00001000'00000000'00000000;
const uint32_t LCD_CTRL    = 0b00000000'00000000'00000000'00000000;
const uint32_t LCD_DATA    = 0b00000000'00000100'00000000'00000000;
const uint32_t LCD_E       = 0b00000000'00000010'00000000'00000000;
const uint32_t LCD_READ    = 0b00000000'00000001'00000000'00000000;
const uint32_t LCD_WRITE   = 0b00000000'00000000'00000000'00000000;


const uint32_t MEM_WE      = 0b00000000'00000000'10000000'00000000;
const uint32_t ALU_BOP_AND = 0b00000000'00000000'00000000'00000000;
const uint32_t ALU_BOP_OR  = 0b00000000'00000000'00010000'00000000;
const uint32_t ALU_BOP_XOR = 0b00000000'00000000'00100000'00000000;
const uint32_t ALU_BOP_NOT = 0b00000000'00000000'00110000'00000000;
const uint32_t ALU_BOP_SLR = 0b00000000'00000000'01000000'00000000;
const uint32_t ALU_BOP_SAR = 0b00000000'00000000'01010000'00000000;
const uint32_t ALU_BOP_ROR = 0b00000000'00000000'01100000'00000000;
const uint32_t ALU_BOP_ROL = 0b00000000'00000000'01110000'00000000;
const uint32_t ALU_SRC_ARI = 0b00000000'00000000'00000000'00000000;
const uint32_t ALU_SRC_BIT = 0b00000000'00000000'00001000'00000000;
const uint32_t ALU_CIN     = 0b00000000'00000000'00000100'00000000;
const uint32_t ALU_AOP_ADD = 0b00000000'00000000'00000000'00000000;
const uint32_t ALU_AOP_SUB = 0b00000000'00000000'00000010'00000000;

const uint32_t HALT        = 0b00000000'00000000'00000000'00010000; //TODO: not implemented in hardware yet
const uint32_t OE_X        = 0b00000000'00000000'00000000'01000000;
const uint32_t OE_ALU      = 0b00000000'00000000'00000000'01010000;
const uint32_t OE_PC_L     = 0b00000000'00000000'00000000'01100000;
const uint32_t OE_PC_H     = 0b00000000'00000000'00000000'01110000;
const uint32_t OE_F        = 0b00000000'00000000'00000000'10000000;
const uint32_t OE_A        = 0b00000000'00000000'00000000'10010000;
const uint32_t OE_T        = 0b00000000'00000000'00000000'10100000;
const uint32_t OE_B        = 0b00000000'00000000'00000000'10110000;
const uint32_t OE_SP_L     = 0b00000000'00000000'00000000'11000000;
const uint32_t OE_SP_H     = 0b00000000'00000000'00000000'11010000;
const uint32_t OE_IR       = 0b00000000'00000000'00000000'11100000;
const uint32_t OE_BUF      = 0b00000000'00000000'00000000'11110000;
const uint32_t MEM_EN_IO   = 0b00000000'00000000'00000000'00000100;
const uint32_t INC_X       = 0b00000000'00000000'00000000'00000010;
const uint32_t DEC_X       = 0b00000000'00000000'00000000'00000001;

std::unordered_map<std::string, uint32_t> controlSignalBitMasks = {
  {"IE_MAR_H",    IE_MAR_H},
  {"IE_PC_H",     IE_PC_H},
  {"IE_PC_L",     IE_PC_L},
  {"RSC",         RSC},
  {"IE_A",        IE_A},
  {"IE_SP_H",     IE_SP_H},
  {"IE_SP_L",     IE_SP_L},
  {"IE_BUF",      IE_BUF},
  {"IE_MAR_L",    IE_MAR_L},
  {"INC_PC",      INC_PC},
  {"IE_F",        IE_F},
  {"IE_B",        IE_B},
  {"IE_X",        IE_X},
  {"LCD_CTRL",    LCD_CTRL},
  {"LCD_DATA",    LCD_DATA},
  {"LCD_E",       LCD_E},
  {"LCD_READ",    LCD_READ},
  {"LCD_WRITE",   LCD_WRITE},
  {"IE_7SD",      IE_7SD},
  {"MEM_WE",      MEM_WE},
  {"ALU_BOP_AND", ALU_BOP_AND},
  {"ALU_BOP_OR",  ALU_BOP_OR},
  {"ALU_BOP_XOR", ALU_BOP_XOR},
  {"ALU_BOP_NOT", ALU_BOP_NOT},
  {"ALU_BOP_SLR", ALU_BOP_SLR},
  {"ALU_BOP_SAR", ALU_BOP_SAR},
  {"ALU_BOP_ROR", ALU_BOP_ROR},
  {"ALU_BOP_ROL", ALU_BOP_ROL},
  {"ALU_SRC_ARI", ALU_SRC_ARI},
  {"ALU_SRC_BIT", ALU_SRC_BIT},
  {"ALU_CIN",     ALU_CIN},
  {"ALU_AOP_ADD", ALU_AOP_ADD},
  {"ALU_AOP_SUB", ALU_AOP_SUB},
  {"IE_IR",       IE_IR},
  {"HALT",        HALT},
  {"OE_X",        OE_X},
  {"OE_ALU",      OE_ALU},
  {"OE_PC_L",     OE_PC_L},
  {"OE_PC_H",     OE_PC_H},
  {"OE_F",        OE_F},
  {"OE_A",        OE_A},
  {"OE_T",        OE_T},
  {"OE_B",        OE_B},
  {"OE_SP_L",     OE_SP_L},
  {"OE_SP_H",     OE_SP_H},
  {"OE_IR",       OE_IR},
  {"OE_BUF",      OE_BUF},
  {"IE_T",        IE_T},
  {"MEM_EN_IO",   MEM_EN_IO},
  {"INC_X",       INC_X},
  {"DEC_X",       DEC_X}
};

std::string registers[] = {"A", "B", "X", "T"};
std::string lcdregisters[] = {"CTRL", "DATA"};

void loadInstructions(const char* fileName);
void handleSpecialCaseMovs(std::string opcodeBinaryString, std::vector<std::vector<std::string>> activeBits);
void processInstruction(bool flag, std::string opcodeBinaryString, std::vector<std::vector<std::string>> activeBits);
std::vector<uint32_t> encodeMicroinstructions(std::vector<std::vector<std::string>> activeBits);
void storeMicroinstructions(bool flag, std::string opcodeBinaryString, std::vector<uint32_t> outputBitsBasedOnMicroinstruction);
void substituteArgument(std::vector<std::vector<std::string>> &values, std::string argument, std::string replacement);
void replaceAll(std::string &str, const std::string &from, const std::string &to);

//Control EEPROM Address
// 12 11 10 9 8 7 6 5 4 3 2 1 0
//  F  C  C C C I I I I I I I I 
//     msb  lsb msb         lsb
//
// I = Instruction
// C = Microstep Counter
// F = Flag
int main() {
  uint32_t binData[EEPROM_SIZE];
  std::fill(binData, binData + EEPROM_SIZE, defaultPattern);

  loadInstructions("../docs/resources/data/instructionData.json");

  for(int flagBit = 0; flagBit <= 1; flagBit++) {
    for(int microstep = 0; microstep <= 15; microstep++) {
      for(int opcode = 0; opcode <= 255; opcode++) {
        int address = (flagBit << 12) | (microstep << 8) | opcode;  //map instructions entries to addresses
        binData[address] = instructions[flagBit][opcode][microstep]; //and store them in the output data
      }
    }
  }

  std::ofstream outputBinFileStreams[] = {
    std::ofstream("../bin/ControllerEEPROM_1.bin", std::ios::binary),
    std::ofstream("../bin/ControllerEEPROM_2.bin", std::ios::binary),
    std::ofstream("../bin/ControllerEEPROM_3.bin", std::ios::binary),
    std::ofstream("../bin/ControllerEEPROM_4.bin", std::ios::binary)
  };

  for(int i = 0; i <= 3; i++) {
    for(int j = 0; j < EEPROM_SIZE; j++) {
      char byte = (binData[j] >> (24 - 8 * i)) & 0xFF;
      outputBinFileStreams[i].write(&byte, sizeof(byte));
    }
    outputBinFileStreams[i].close();
  }

  return 0;
}

void loadInstructions(const char* fileName) {
  std::fill(&instructions[0][0][0], (&instructions[0][0][0]) + 2 * 256 * 16, defaultPattern); //initialize every entry of instructions to defaultPattern

  std::ifstream jsonFile(fileName);
  json instructionsJsonArray = json::parse(jsonFile)["instructions"];

  for(int i = 0; i < instructionsJsonArray.size(); i++) {
    auto currentInstruction = instructionsJsonArray[i];
    if(currentInstruction["type"] == "PSEUDO") continue;  //skip pseudo-instructions as they are not part of the Controller EEPROM
    
    std::string opcodeBinaryString = currentInstruction["opcode"];

    if(currentInstruction["mnemonic"] == "movs") {
      handleSpecialCaseMovs(opcodeBinaryString, currentInstruction["microinstructions"]);
      continue;
    }

    if(currentInstruction["requiresFlag"]) {
      processInstruction(false, opcodeBinaryString, currentInstruction["microinstructions"]["0"]);
      processInstruction(true, opcodeBinaryString, currentInstruction["microinstructions"]["1"]);
    } else {
      processInstruction(false, opcodeBinaryString, currentInstruction["microinstructions"]); //if no flag is required, use the same microinstructions for flag = 0 and flag = 1
      processInstruction(true, opcodeBinaryString, currentInstruction["microinstructions"]);
    }
  }
}

void handleSpecialCaseMovs(std::string opcodeBinaryString, std::vector<std::vector<std::string>> activeBits) {
  std::ifstream jsonFile("../docs/resources/data/movsData.json");
  json movsData = json::parse(jsonFile);
  std::string firstNibble = opcodeBinaryString;
  replaceAll(firstNibble, "R", "");

  for(int i = 0; i < movsData.size(); i++) {
    auto currentData = movsData[i];
    std::string secondNibble = currentData["secondNibble"];
    std::string sourceRegister = currentData["from"];
    if(sourceRegister == "TMP") {
      sourceRegister = "T";
    }
    std::string destinationRegister = currentData["to"];
    if(destinationRegister == "TMP") {
      destinationRegister = "T";
    }
    std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
    substituteArgument(activeBitsCopy, "<regss>", sourceRegister);
    substituteArgument(activeBitsCopy, "<regsd>", destinationRegister);

    const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);
    opcodeBinaryString = firstNibble + secondNibble;
    storeMicroinstructions(true, opcodeBinaryString, activeBits_bin);
    storeMicroinstructions(false, opcodeBinaryString, activeBits_bin);
  }
}

void processInstruction(bool flag, std::string opcodeBinaryString, std::vector<std::vector<std::string>> activeBits) {
  int registerIndex = opcodeBinaryString.find('R'); //used for checking if the opcode contains register arguments
  int lcdRegisterIndex = opcodeBinaryString.find('L');

  if(registerIndex == std::string::npos) { //no register arguments
    if(lcdRegisterIndex != std::string::npos) {
      for(int i = 0; i < 2; i++) {
        std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
        substituteArgument(activeBitsCopy, "<lcdreg>", lcdregisters[i]);
        const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);
        std::bitset<1> lcdbit(i);
        opcodeBinaryString.replace(lcdRegisterIndex, 1, lcdbit.to_string()); //substitute argument in opcode
        storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
      }
    } else {
      const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBits);
      storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
    }
  } else if(registerIndex == 6) { //one register argument
    for(int i = 0; i < 2; i++) {
      for(int j = 0; j < 4; j++) {
        std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
        substituteArgument(activeBitsCopy, "<reg>", registers[j]);
        substituteArgument(activeBitsCopy, "<lcdreg>", lcdregisters[i]);

        const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);

        std::bitset<2> bits(j);
        opcodeBinaryString.replace(6, 2, bits.to_string()); //substitute argument in opcode
        
        //if it's an LCD-instruction
        if(lcdRegisterIndex != std::string::npos) {
          std::bitset<1> lcdbit(i);
          opcodeBinaryString.replace(lcdRegisterIndex, 1, lcdbit.to_string()); //substitute argument in opcode
        }
        storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
      }
    }
  } else if(registerIndex == 4) { //two register arguments
    for(int regd = 0; regd < 4; regd++) {
      for(int regs = 0; regs < 4; regs++) {
        std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
        substituteArgument(activeBitsCopy, "<regd>", registers[regd]);
        substituteArgument(activeBitsCopy, "<regs>", registers[regs]);

        const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);
        std::bitset<2> bitsRegs(regs);
        std::bitset<2> bitsRegd(regd);
        opcodeBinaryString.replace(4, 2, bitsRegs.to_string()); //substitute arguments in opcode
        opcodeBinaryString.replace(6, 2, bitsRegd.to_string());
        storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
      }
    }
  } else {
    std::cerr << "Register Index not valid. Should be -1, 4 or 6, but was: " + std::to_string(registerIndex) << std::endl;
  }
}

std::vector<uint32_t> encodeMicroinstructions(std::vector<std::vector<std::string>> activeBits) {
  std::vector<uint32_t> encodedMicroinstructions;
  
  for(int i = 0; i < activeBits.size(); i++) {
    uint32_t pattern = defaultPattern;
    for(int j = 0; j < activeBits[i].size(); j++) {
      const uint32_t bitMask = controlSignalBitMasks.at(activeBits[i][j]);
      pattern ^= bitMask; //XOR the pattern with every active bitmask <=> invert the bits in the pattern specified by the bitmask, making them active
    }
    encodedMicroinstructions.push_back(pattern);
  }

  while(encodedMicroinstructions.size() < 16) { //fill remaining microinstructions with default pattern, but practically, they won't be ever reached
    encodedMicroinstructions.push_back(defaultPattern);
  }

  return encodedMicroinstructions;
}

void storeMicroinstructions(bool flag, std::string opcodeBinaryString, std::vector<uint32_t> outputBitsBasedOnMicroinstruction) {
  uint8_t opcode = std::stoi(opcodeBinaryString, nullptr, 2);
  int flagIndex = flag ? 1 : 0;
  for(int i = 0; i < outputBitsBasedOnMicroinstruction.size(); i++) {
    instructions[flagIndex][opcode][i] = outputBitsBasedOnMicroinstruction[i];
  }
}

void substituteArgument(std::vector<std::vector<std::string>> &values, std::string argument, std::string replacement) {
  for(int i = 0; i < values.size(); i++) {
    for(int j = 0; j < values[i].size(); j++) {
      replaceAll(values[i][j], argument, replacement);
    }
  }
}

void replaceAll(std::string &str, const std::string &from, const std::string &to) {
  int pos = 0;
  while ((pos = str.find(from, pos)) != std::string::npos) {
      str.replace(pos, from.length(), to);
      pos += to.length();
  }
}
