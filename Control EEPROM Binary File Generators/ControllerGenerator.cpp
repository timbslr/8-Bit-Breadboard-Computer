#include <cstdint>
#include <iostream>
#include <fstream>

const int EEPROM_SIZE = 8192; // Size of the EEPROM in bytes

uint32_t instructions[2][256][16] = {};  // initialize everything with zero
// 2 = Flag Bit (0 or 1)
// 256 = amount of opcodes (0x00 - 0xFF)
// 16 = amount of microsteps (0 - 15)

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

  loadInstructions("../instructionData.json");
  for(int flagBit = 0; flagBit <= 1; flagBit++) {
    for(int microstep = 0; microstep <= 15; microstep++) {
      for(int opcode = 0; opcode <= 255; opcode++) {
        int address = (flagBit << 12) | (microstep << 8) | opcode;
        binData[address] = instructions[flagBit][microstep][opcode];
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

