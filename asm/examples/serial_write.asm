#include "rules.asm"

STRING_ADDR = 0x6000

#addr STRING_ADDR
#d "Hello World!\r\nIt finally works!\r\n3\r\n2\r\n1\r\n---GOGOGO---\r\n" ; The string that should be sent via serial
#addr 0

loop:
  mov A, X
  bgei 56, end; bgeiu broken? //TODO fix
  ldo B, STRING_ADDR
rdy_wait:
  btxrdyc rdy_wait
  txsend B
  incx
  jmp loop

end:
  hlt

#include "common.asm"