#include <cstdint>
#include <iostream>
#include <fstream>

const int EEPROM_SIZE = 8192; // Size of the EEPROM in bytes

uint32_t instructions[2][256][16] = {};  // initialize everything with zero
// 2 = Flag Bit (0 or 1)
// 256 = amount of opcodes (0x00 - 0xFF)
// 16 = amount of microsteps (0 - 15)


//  |                                  CTRL1                                 |                          CTRL2                             |                                         CTRL3                               |                                    CTRL4
//  |      msb                                                         lsb   |    msb                                               lsb   |   msb                                                                 lsb   |   msb                                                              lsb  |      
//  |      7         6         5      4     3        2         1        0    |     7      6     5      4      3      2       1       0    |    7         6          5          4         3        2        1       0    |    7         6         5         4        3        2         1      0   |
//  | #IE_MAR_H  #IE_PC_H  #IE_PC_L  RSC  #IE_A  #IE_SP_H  #IE_SP_L  #IE_PRB | #IE_MAR_L  CE  #IE_F  #IE_B  #IE_X  LCD_RS  LCD_E  #IE_7SD | #MEM_WE  ALU_BOP_2  ALU_BOP_1  ALU_BOP_0  ALU_SRC  ALU_CIN  ALU_AOP  #IE_IR | OE_MUX_D  OE_MUX_C  OE_MUX_B  OE_MUX_A  #IE_T  #MEM_EN_IO  INC_X  DEC_X |
const uint32_t defaultPattern = 0b11101111'10111001'10000001'00001100;

const uint32_t IE_MAR_H    = 0b10000000'00000000'00000000'00000000;
const uint32_t IE_PC_H     = 0b01000000'00000000'00000000'00000000;
const uint32_t IE_PC_L     = 0b00100000'00000000'00000000'00000000;
const uint32_t RSC         = 0b00010000'00000000'00000000'00000000;
const uint32_t IE_A        = 0b00001000'00000000'00000000'00000000;
const uint32_t IE_SP_H     = 0b00000100'00000000'00000000'00000000;
const uint32_t IE_SP_L     = 0b00000010'00000000'00000000'00000000;
const uint32_t IE_PRB      = 0b00000001'00000000'00000000'00000000;

const uint32_t IE_MAR_L    = 0b00000000'10000000'00000000'00000000;
const uint32_t CE          = 0b00000000'01000000'00000000'00000000;
const uint32_t IE_F        = 0b00000000'00100000'00000000'00000000;
const uint32_t IE_B        = 0b00000000'00010000'00000000'00000000;
const uint32_t IE_X        = 0b00000000'00001000'00000000'00000000;
const uint32_t LCD_RS      = 0b00000000'00000100'00000000'00000000;
const uint32_t LCD_E       = 0b00000000'00000010'00000000'00000000;
const uint32_t IE_7SD      = 0b00000000'00000001'00000000'00000000;

const uint32_t MEM_WE      = 0b00000000'00000000'10000000'00000000;
const uint32_t ALU_BOP_AND = 0b00000000'00000000'00000000'00000000;
const uint32_t ALU_BOP_OR  = 0b00000000'00000000'00010000'00000000;
const uint32_t ALU_BOP_XOR = 0b00000000'00000000'00100000'00000000;
const uint32_t ALU_BOP_NOT = 0b00000000'00000000'00110000'00000000;
const uint32_t ALU_BOP_SHL = 0b00000000'00000000'01000000'00000000;
const uint32_t ALU_BOP_SLR = 0b00000000'00000000'01010000'00000000;
const uint32_t ALU_BOP_SAR = 0b00000000'00000000'01100000'00000000;
const uint32_t ALU_BOP_ROR = 0b00000000'00000000'01110000'00000000;
const uint32_t ALU_SRC     = 0b00000000'00000000'00001000'00000000;
const uint32_t ALU_CIN     = 0b00000000'00000000'00000100'00000000;
const uint32_t ALU_AOP_ADD = 0b00000000'00000000'00000000'00000000;
const uint32_t ALU_AOP_SUB = 0b00000000'00000000'00000010'00000000;
const uint32_t IE_IR       = 0b00000000'00000000'00000001'00000000;

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
const uint32_t OE_PRB      = 0b00000000'00000000'00000000'11110000;
const uint32_t IE_T        = 0b00000000'00000000'00000000'00001000;
const uint32_t MEM_EN_IO   = 0b00000000'00000000'00000000'00000100;
const uint32_t INC_X       = 0b00000000'00000000'00000000'00000010;
const uint32_t DEC_X       = 0b00000000'00000000'00000000'00000001;


//Control EEPROM Address
// 12 11 10 9 8 7 6 5 4 3 2 1 0
//  F  C  C C C I I I I I I I I 
//     msb  lsb msb         lsb
//
// I = Instruction
// C = Microstep Counter
// F = Flag

void loadInstructions(const char* fileName);

int main() {
  uint32_t binData[EEPROM_SIZE];
  std::fill(binData, binData + EEPROM_SIZE, defaultPattern);

  loadInstructions("../instructionData.json");
  for(int flagBit = 0; flagBit <= 1; flagBit++) {
    for(int microstep = 0; microstep <= 15; microstep++) {
      for(int opcode = 0; opcode <= 255; opcode++) {
        int address = (flagBit << 12) | (microstep << 8) | opcode;
        //binData[address] = instructions[flagBit][microstep][opcode];
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
  //TODO
  //TODO XOR bits from microinstructions
}

