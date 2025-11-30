#include "rules.asm"

STRING_ADDR = 0x9000

outlcdi CTRL, %00000001 ; Clear display
outlcdi CTRL, %00111000 ; Function set:             8-bit display interface, 2-line display, 5x8 dots
outlcdi CTRL, %00001100 ; Display on/off control:   display on, cursor off, cursor blinking off
outlcdi CTRL, %00000110 ; Entry mode set:           move cursor from left to right, no display shift

li B, "C" 
sto B, STRING_ADDR ; Attention: Don't use the A- or TMP-Register here, as they are clobbered registers. They will be overwritten during execution of sto
incx 
li B, "l"
sto B, STRING_ADDR
incx 
li B, "o"
sto B, STRING_ADDR
incx 
li B, "b"
sto B, STRING_ADDR
incx 
li B, "b"
sto B, STRING_ADDR
incx 
li B, "e"
sto B, STRING_ADDR
incx 
li B, "r"
sto B, STRING_ADDR
incx 
li B, "e"
sto B, STRING_ADDR
incx 
li B, "d"
sto B, STRING_ADDR
incx 
li B, " "
sto B, STRING_ADDR
incx 
li B, "R"
sto B, STRING_ADDR
incx
li B, "e"
sto B, STRING_ADDR
incx
li B, "g"
sto B, STRING_ADDR
incx
li B, "."
sto B, STRING_ADDR

clr X

loop:
  mov A, X
  bgei 14, end
  ldo B, STRING_ADDR
  outlcd DATA, B
  incx
  jmp loop

end:
