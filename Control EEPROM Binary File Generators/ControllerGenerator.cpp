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


//  |                                CTRL1                                                   |                              CTRL2                                  |                                         CTRL3                              |                                    CTRL4
//  |   msb                                                                         lsb      |    msb                                                        lsb   |   msb                                                                lsb   |   msb                                                                  lsb       |      
//  |    7         6         5         4         3           2            1          0       |     7         6         5       4      3      2       1      0      |    7         6          5          4         3        2        1      0    |    7         6         5         4        3        2         1          0        |
//  |   RSC     IE_DEC_D  IE_DEC_C  IE_DEC_B  IE_DEC_A  #SER_RX_SEND  #7SD_UM  SER_RX_CONS   |  RST_TMP  #MEM_EN_IO  #IE_F  #7SD_SM        LCD_RS  LCD_E  LCD_RW   | #MEM_WE  ALU_BOP_2  ALU_BOP_1  ALU_BOP_0  ALU_SRC  ALU_CIN  ALU_AOP        | OE_DEC_D  OE_DEC_C  OE_DEC_B  OE_DEC_A   HALT  CNT_DEC_C  CNT_DEC_B  CNT_DEC_A   |
const uint32_t defaultPattern = 0b00000010'01110000'10000000'00000000;

std::unordered_map<std::string, uint32_t> controlSignalBitMasks = {
  {"RSC",         0b10000000'00000000'00000000'00000000},

  {"IE_C",        0b00001000'00000000'00000000'00000000},
  {"IE_Y",        0b00010000'00000000'00000000'00000000},
  {"IE_X",        0b00011000'00000000'00000000'00000000},
  {"IE_TMP",      0b00100000'00000000'00000000'00000000},
  {"IE_PC_L",     0b00101000'00000000'00000000'00000000},
  {"IE_7SD",      0b00110000'00000000'00000000'00000000},
  {"IE_PC_H",     0b01001000'00000000'00000000'00000000},
  {"IE_MAR_H",    0b01010000'00000000'00000000'00000000},
  {"IE_IR",       0b01011000'00000000'00000000'00000000},
  {"IE_BUF",      0b01100000'00000000'00000000'00000000},
  {"IE_A",        0b01101000'00000000'00000000'00000000},
  {"IE_MAR_L",    0b01110000'00000000'00000000'00000000},
  {"IE_B",        0b01111000'00000000'00000000'00000000},

  {"SER_RX_SEND", 0b00000100'00000000'00000000'00000000},
  {"7SD_UM",      0b00000010'00000000'00000000'00000000}, // unsigned mode
  {"SER_RX_CONS", 0b00000001'00000000'00000000'00000000}, // the received byte was consumed
  {"RST_TMP",     0b00000000'10000000'00000000'00000000},
  {"MEM_EN_IO",   0b00000000'01000000'00000000'00000000},
  {"IE_F",        0b00000000'00100000'00000000'00000000},
  {"7SD_SM",      0b00000000'00010000'00000000'00000000}, // signed mode

  {"LCD_CTRL",    0b00000000'00000000'00000000'00000000},
  {"LCD_DATA",    0b00000000'00000100'00000000'00000000},
  {"LCD_E",       0b00000000'00000010'00000000'00000000},
  {"LCD_READ",    0b00000000'00000001'00000000'00000000},
  {"LCD_WRITE",   0b00000000'00000000'00000000'00000000},

  {"MEM_WE",      0b00000000'00000000'10000000'00000000},
  {"ALU_BOP_AND", 0b00000000'00000000'00000000'00000000},
  {"ALU_BOP_OR",  0b00000000'00000000'00010000'00000000},
  {"ALU_BOP_XOR", 0b00000000'00000000'00100000'00000000},
  {"ALU_BOP_NOT", 0b00000000'00000000'00110000'00000000},
  {"ALU_BOP_SLR", 0b00000000'00000000'01000000'00000000},
  {"ALU_BOP_SAR", 0b00000000'00000000'01010000'00000000},
  {"ALU_BOP_ROR", 0b00000000'00000000'01100000'00000000},
  {"ALU_BOP_ROL", 0b00000000'00000000'01110000'00000000},
  {"ALU_SRC_ARI", 0b00000000'00000000'00000000'00000000},
  {"ALU_SRC_BIT", 0b00000000'00000000'00001000'00000000},
  {"ALU_CIN",     0b00000000'00000000'00000100'00000000},
  {"ALU_AOP_ADD", 0b00000000'00000000'00000000'00000000},
  {"ALU_AOP_SUB", 0b00000000'00000000'00000010'00000000},

  {"OE_C",        0b00000000'00000000'00000000'00010000},
  {"OE_Y",        0b00000000'00000000'00000000'00100000},
  {"OE_SER_RX",   0b00000000'00000000'00000000'00110000},
  {"OE_X",        0b00000000'00000000'00000000'01000000},
  {"OE_ALU",      0b00000000'00000000'00000000'01010000},
  {"OE_PC_L",     0b00000000'00000000'00000000'01100000},
  {"OE_PC_H",     0b00000000'00000000'00000000'01110000},
  {"OE_F",        0b00000000'00000000'00000000'10000000},
  {"OE_A",        0b00000000'00000000'00000000'10010000},
  {"OE_TMP",      0b00000000'00000000'00000000'10100000},
  {"OE_B",        0b00000000'00000000'00000000'10110000},
  {"OE_SP_L",     0b00000000'00000000'00000000'11000000},
  {"OE_SP_H",     0b00000000'00000000'00000000'11010000},
  {"OE_IR",       0b00000000'00000000'00000000'11100000},
  {"OE_BUF",      0b00000000'00000000'00000000'11110000},

  {"HALT",        0b00000000'00000000'00000000'00001000},

  {"INC_PC",      0b00000000'00000000'00000000'00000001}, // decoder makes it active low, inverter makes it active high again
  {"INC_X",       0b00000000'00000000'00000000'00000010},
  {"DEC_X",       0b00000000'00000000'00000000'00000011},
  {"INC_Y",       0b00000000'00000000'00000000'00000100},
  {"DEC_Y",       0b00000000'00000000'00000000'00000101},
  {"INC_SP",      0b00000000'00000000'00000000'00000110},
  {"DEC_SP",      0b00000000'00000000'00000000'00000111}
};

const std::string registers[] = {"A", "TMP", "B", "C", "X", "Y"};
const std::string indexRegisters[] = {"X", "Y"};
const std::string lcdregisters[] = {"CTRL", "DATA"};
const int AMOUNT_OF_REGISTERS = sizeof(registers) / sizeof(registers[0]);

constexpr unsigned int ceilLog2(unsigned int n, unsigned int p = 0) {
    return (1U << p) >= n ? p : ceilLog2(n, p + 1);
}

void loadInstructions(const char* fileName);
void handleSpecialCaseMov(std::vector<std::vector<std::string>> activeBits);
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

  loadInstructions("../docs/resources/data/instructionData.jsonc");

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
  json instructionsJsonArray = json::parse(jsonFile, nullptr, true, true)["instructions"];

  for(int i = 0; i < instructionsJsonArray.size(); i++) {
    auto currentInstruction = instructionsJsonArray[i];
    if(currentInstruction["type"] == "PSEUDO") continue;  //skip pseudo-instructions as they are not part of the Controller EEPROM
    
    std::string opcodeBinaryString = currentInstruction["opcode"];

    if(currentInstruction["mnemonic"] == "mov") {
      handleSpecialCaseMov(currentInstruction["microinstructions"]);
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

void handleSpecialCaseMov(std::vector<std::vector<std::string>> activeBits) {
  std::ifstream jsonFile("../docs/resources/data/movData.json");
  json movData = json::parse(jsonFile);

  for(int i = 0; i < movData.size(); i++) {
    auto currentData = movData[i];
    std::string opcode = currentData["opcode"];
    std::string sourceRegister = currentData["from"];
    std::string destinationRegister = currentData["to"];
    std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
    substituteArgument(activeBitsCopy, "<regs>", sourceRegister);
    substituteArgument(activeBitsCopy, "<regd>", destinationRegister);

    const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);
    storeMicroinstructions(true, opcode, activeBits_bin);
    storeMicroinstructions(false, opcode, activeBits_bin);
  }
}

// Only works if each operand type (e.g. register) occurs at most once in the opcode/instruction operand list
void processInstruction(bool flag, std::string opcodeBinaryString, std::vector<std::vector<std::string>> activeBits) {
  int registerIndex = opcodeBinaryString.find('R'); //used for checking if the opcode contains register arguments
  int lcdRegisterIndex = opcodeBinaryString.find('L');

  if(registerIndex == std::string::npos) { //no register arguments
    if(lcdRegisterIndex != std::string::npos) {
      for(int i = 0; i < 2; i++) {
        for(int j = 0; j < 2; j++) {
          std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
          substituteArgument(activeBitsCopy, "<lcdreg>", lcdregisters[i]);
          substituteArgument(activeBitsCopy, "<idxreg>", indexRegisters[j]);

          const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);
          std::bitset<1> lcdbit(i);
          opcodeBinaryString.replace(lcdRegisterIndex, 1, lcdbit.to_string()); //substitute argument in opcode
          storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
        }
      }
    } else {
      for(int j = 0; j < 2; j++) {
        std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
        substituteArgument(activeBitsCopy, "<idxreg>", indexRegisters[j]);
        const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBits);
        storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
      }
    }
  } else if(registerIndex == 4 || registerIndex == 5) { //one register argument
    const int AMOUNT_OF_INDEX_REGISTERS = 2;
    const int AMOUNT_OF_LCD_REGISTERS = 2;

    for(int i = 0; i < AMOUNT_OF_REGISTERS; i++) {
      for(int j = 0; j < AMOUNT_OF_INDEX_REGISTERS; j++) {
        for(int k = 0; k < AMOUNT_OF_LCD_REGISTERS; k++) {
          std::vector<std::vector<std::string>> activeBitsCopy = activeBits;
          substituteArgument(activeBitsCopy, "<reg>", registers[i]);
          substituteArgument(activeBitsCopy, "<idxreg>", indexRegisters[j]);
          substituteArgument(activeBitsCopy, "<lcdreg>", lcdregisters[k]);
  
          const std::vector<uint32_t> activeBits_bin = encodeMicroinstructions(activeBitsCopy);
  
          std::bitset<ceilLog2(AMOUNT_OF_REGISTERS)> registerBits(i);
          replaceAll(opcodeBinaryString, "RRR", registerBits.to_string()); //substitute register argument in opcode
          
          std::bitset<ceilLog2(AMOUNT_OF_LCD_REGISTERS)> indexRegisterBits(j);
          replaceAll(opcodeBinaryString, "X", indexRegisterBits.to_string()); //substitute index-register argument in opcode

          std::bitset<ceilLog2(AMOUNT_OF_LCD_REGISTERS)> lcdbits(k);
          replaceAll(opcodeBinaryString, "L", lcdbits.to_string()); //substitute lcd-register argument in opcode
          
          storeMicroinstructions(flag, opcodeBinaryString, activeBits_bin);
        }
      }
    }
  } else {
    std::cerr << "Register Index not valid. Should be -1 or 5, but was: " + std::to_string(registerIndex) << std::endl;
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
