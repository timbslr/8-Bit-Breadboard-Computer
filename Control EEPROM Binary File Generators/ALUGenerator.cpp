#include <cstdint>
#include <iostream>
#include <fstream>
#include <cstdint>


const int EEPROM_SIZE = 2048; // Size of the EEPROM in bytes

// 10 9 8 7 6 5 4 3 2 1 0
//  o o o b b b b b b b b 
// msb                 lsb
// o = ALU Bitwise op-code
// b = Binary data from the A- and TMP-Register
//
int main() {
  uint8_t binData[EEPROM_SIZE];

  for (int ALU_BW_op = 0; ALU_BW_op <= 7; ALU_BW_op++) { // 000 = AND, 001 = OR, 010 = XOR, 011 = NOT | 100 = SLR, 101 = SAR, 110 = ROR, 111 = ROL
    for (int num = 0; num <= 255; num++) {
      int address = (ALU_BW_op << 8) | num;

      uint8_t lowNibble = (num & 0x0F);
      uint8_t highNibble = (num & 0xF0) >> 4;

      int result = 0;
      switch (ALU_BW_op) {
      case 0b000:  // AND
        result = (highNibble & lowNibble) << 4;
        break;
      case 0b001:  // OR
        result = (highNibble | lowNibble) << 4;
        break;
      case 0b010:  // XOR
        result = (highNibble ^ lowNibble) << 4;
        break;
      case 0b011:  // NOT
        result = (~highNibble) << 4;
        break;
      case 0b100:  // SLR
        result = num >> 1;
        break;
      case 0b101: {  // SAR
        uint8_t sign = (num & 0b10000000);
        result = (num >> 1) | sign;
        break;
      }
      case 0b110: { //ROR
        uint8_t lsb = num & 0b00000001;
        result = (num >> 1) | (lsb << 7);
        break;
      }
      case 0b111: { // ROL
        uint8_t msb = num & 0b10000000;
        result = (num << 1) | (msb >> 7);
        break;
      }
      }
      result &= 0xFF;
      binData[address] = result;
    }
  }

  std::ofstream outputBinFileStream("../bin/ALUControllerEEPROM.bin", std::ios::binary);
  outputBinFileStream.write((const char*)binData, sizeof(binData));
  outputBinFileStream.close();
  return 0;
}
