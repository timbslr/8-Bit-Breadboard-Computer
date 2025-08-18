EEPROM_SIZE = 2048 # Size of the EEPROM in bytes
bin_data = bytearray(EEPROM_SIZE)

dec_digits = bytearray([
  0b01111110, # 0
  0b00110000, # 1
  0b01101101, # 2 
  0b01111001, # 3
  0b00110011, # 4
  0b01011011, # 5
  0b01011111, # 6 
  0b01110000, # 7
  0b01111111, # 8
  0b01111011, # 9
])

hex_digits = bytearray([
  *dec_digits[:10], # 0-9
  0b01110111, # A
  0b00011111, # B
  0b01001110, # C
  0b00111101, # D
  0b01001111, # E
  0b01000111, # F
])

# Address inputs for the EEPROM:
# 10 9 8 7 6 5 4 3 2 1 0
#  M D D b b b b b b b b 
# msb                 lsb
# M = Mode (0 = signed, 1 = hexadecimal)
# D = Digit (00 = first, 01 = second, 10 = third, 11 = fourth)
# b = Binary data from the bus (-128 to 127)

def main():
  for mode in range(2):  # Mode: 0 = signed, 1 = hexadecimal
    for digit in range(4):
      for num in range(-128, 128):
        twos_complement = num.to_bytes(1, 'big', signed=True)[0]
        address = (mode << 10) | (digit << 8) | twos_complement
        bin_data[address] = compute_value(mode, digit, num)

  with open("../bin/7segDisplayControlEEPROM.bin", "wb") as f:
    f.write(bin_data)

# Value at a given address:
# 7 6 5 4 3 2 1 0
# D a b c d e f g
# where D is the decimal point and a-g are the segments of the 7-segment display
def compute_value(mode, digit, num):
  if mode == 0:  # signed decimal
    num_char_arr = list(str(num))
    while len(num_char_arr) < 4:
      num_char_arr.insert(0, 0)

    char_to_print = num_char_arr[digit]

    if char_to_print == 0: return 0b00000000
    elif char_to_print == '-': return 0b00000001
    else: return dec_digits[int(char_to_print)] 

  else:   #hex
    index = [0, 0, num >> 4, num & 0x0F][digit]
    return hex_digits[index]

if __name__ == "__main__":
    main()
