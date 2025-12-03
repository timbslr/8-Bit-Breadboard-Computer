#include "rules.asm"

STRING_ADDR = 0x7000

#addr STRING_ADDR
#d "It's working!" ; The string that should be displayed on the lcd
#addr 0

outlcdi CTRL, %00000001 ; Clear display
outlcdi CTRL, %00111000 ; Function set:             8-bit display interface, 2-line display, 5x8 dots
outlcdi CTRL, %00001100 ; Display on/off control:   display on, cursor off, cursor blinking off
outlcdi CTRL, %00000110 ; Entry mode set:           move cursor from left to right, no display shift

loop:
  mov A, X
  bgei 13, end
  ldo B, STRING_ADDR
  outlcd DATA, B
  incx
  jmp loop

end:
  hlt
