#include <iostream>
#include <fstream>
#include <cstdint>
#include <cstring>
#include <sstream>
#include <iomanip>

const int EEPROM_SIZE = 2048; // size of the EEPROM in bytes

const uint8_t dec_digits[] = {
  0b01111110, // 0
  0b00110000, // 1
  0b01101101, // 2 
  0b01111001, // 3
  0b00110011, // 4
  0b01011011, // 5
  0b01011111, // 6 
  0b01110000, // 7
  0b01111111, // 8
  0b01111011, // 9
};

const uint8_t hex_digits[] = {
  dec_digits[0], // 0
  dec_digits[1], // 1
  dec_digits[2], // 2
  dec_digits[3], // 3
  dec_digits[4], // 4
  dec_digits[5], // 5
  dec_digits[6], // 6
  dec_digits[7], // 7
  dec_digits[8], // 8
  dec_digits[9], // 9
  0b01110111,    // A
  0b00011111,    // B
  0b01001110,    // C
  0b00111101,    // D
  0b01001111,    // E
  0b01000111,    // F
};

int computeValue(int mode, int digit, int num);

int main() {
  uint8_t binData[EEPROM_SIZE];

  // Address inputs for the EEPROM :
  // 10 9 8 7 6 5 4 3 2 1 0
  //  M D D b b b b b b b b
  // msb                 lsb
  // M = Mode(0 = signed, 1 = hexadecimal)
  // D = Digit(00 = first, 01 = second, 10 = third, 11 = fourth)
  // b = Binary data from the bus(-128 to 127)

  for (int mode = 0; mode <= 1; mode++) { // Mode : 0 = signed, 1 = hexadecimal
    for (int digit = 0; digit <= 3; digit++) {
      for (int num = -128; num <= 127; num++) {
        int address = (mode << 10) | (digit << 8) | (uint8_t)num;
        binData[address] = computeValue(mode, digit, num);
      }
    }
  }

  std::ofstream outputBinFileStream("../bin/7segDisplayControlEEPROM.bin", std::ios::binary);
  outputBinFileStream.write((const char*)binData, sizeof(binData));
  outputBinFileStream.close();
  return 0;
}


// Value at a given address :
// 7 6 5 4 3 2 1 0
// D a b c d e f g
// where D is the decimal point and a - g are the segments of the 7 - segment display
int computeValue(int mode, int digit, int num) {
  if (mode == 0) { // signed decimal
    std::string numString = std::to_string(num);

    while (numString.size() < 4) {
      numString = '\0' + numString;
    }

    char char_to_print = numString[digit];

    if (char_to_print == '\0') return 0b00000000;
    else if (char_to_print == '-') return 0b00000001;
    return dec_digits[char_to_print - '0'];
  }
  else {   // hex
    int indices[] = { 0, 0, ((uint8_t)num) >> 4, num & 0x0F };
    int index = indices[digit];

    if (index == 0 && digit != 0b11) return 0b00000000;
    return hex_digits[index];
  }
}
