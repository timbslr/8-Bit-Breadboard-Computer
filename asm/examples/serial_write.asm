#include "rules.asm"

STRING_ADDR = 0x6000

#addr STRING_ADDR
#d "Hey, it's working!\nFull speed incoming!!!\nLets start some Wozmon Action in\n3\n2\n1\nWOZMON!!! --------------------GOGOGO----------------" ; The string that should be sent via serial
#addr 0

loop:
  mov A, X
  bgei 120, end; bgeiu broken?
  ldo B, STRING_ADDR
rdy_wait:
  btxrdyc rdy_wait
  txsend B
  incx
  jmp loop

end:
  hlt

#include "common.asm"