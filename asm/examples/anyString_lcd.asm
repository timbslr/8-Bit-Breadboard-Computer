#include "rules.asm"

STRING_ADDR = 0x7000

#addr STRING_ADDR
#d "It's working!" ; The string that should be displayed on the lcd
#addr 0

call lcd_init

loop:
  mov A, X
  bgei 13, end
  ldo B, STRING_ADDR
  call print_char
  incx
  jmp loop

end:
  hlt

#include "common.asm"
