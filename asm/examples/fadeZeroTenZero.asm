#include "./rules.asm"

start:
li X, 10
loop:
mov A, X
blei 0, loop2
out7sd X
decx
jmp loop
loop2:
mov A, X
bgei 10, end
out7sd X
incx
jmp loop2
end:
jmp start