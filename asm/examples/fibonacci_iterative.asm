#include "rules.asm"

s7sdum ; set 7-Segment display unsigned mode
li A, 1
li B, 1

fib:
  bcs end    ; branch if next fib number > 255
  out7sd B   ; The last output will be 233 as the next fibonacci number (377) is greater than the maximum number that can be displayed (255)
  mov TMP, B ; TMP := B
  add B      ; B = A + TMP
  mov A, TMP ; A := TMP
  jmp fib

end:
