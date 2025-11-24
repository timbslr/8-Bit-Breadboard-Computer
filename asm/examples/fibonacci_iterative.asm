#include "rules.asm"

li A, 1
li B, 1

fib:
  bvs end    ; branch if next fib number > 127
  out7sd B   ; The last output will be 89 as the next fibonacci number (144) is greater than the maximum number that can be displayed (127)
  mov TMP, B ; TMP := B
  add B      ; B = A + TMP
  mov A, TMP ; A := TMP
  jmp fib

end:
