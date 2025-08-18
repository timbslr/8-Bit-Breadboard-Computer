EEPROM_SIZE = 2048 # Size of the EEPROM in bytes
bin_data = bytearray(EEPROM_SIZE)

# 10 9 8 7 6 5 4 3 2 1 0
#  o o o b b b b b b b b 
# msb                 lsb
# o = ALU Bitwise op-code
# b = Binary data from the A- and TMP-Register

def main():
  for ALU_BW_op in range(8):  # 000 = AND, 001 = OR, 010 = XOR, 011 = NOT | 100 = SHL, 101 = SLR, 110 = SAR, 111 = ROR 
    for num in range(-128, 128):
      twos_complement = num.to_bytes(1, 'big', signed=True)[0]
      address = (ALU_BW_op << 8) | twos_complement

      low_nibble = (twos_complement & 0x0F)
      high_nibble = (twos_complement & 0xF0) >> 4

      match ALU_BW_op:
        case 0b000:  # AND
            result = high_nibble & low_nibble
        case 0b001:  # OR
            result = high_nibble | low_nibble
        case 0b010:  # XOR
            result = high_nibble ^ low_nibble
        case 0b011:  # NOT
            result = ~twos_complement
        case 0b100:  # SHL
            result = twos_complement << 1
        case 0b101:  # SLR
            result = twos_complement >> 1
        case 0b110:  # SAR
            sign = (twos_complement & 0b10000000)
            result = (twos_complement >> 1) | sign
        case 0b111:  # ROR
            lsb = twos_complement & 0b00000001
            result = (twos_complement >> 1) | (lsb << 7)

      bin_data[address] = result

  with open("../bin/ALUControllerEEPROM.bin", "wb") as f:
    f.write(bin_data)