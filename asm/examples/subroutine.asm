#include "./rules.asm"

out7sdi 1
out7sdi 2
out7sdi 3
call f1
out7sdi 37
out7sdi 38
out7sdi 39
call f2
out7sdi 100
out7sdi 101
out7sdi 102
out7sdi 103
out7sdi 104
  
hlt

#addr 0x15EA
f2:
  out7sdi 40
  out7sdi 50
  out7sdi 60
  out7sdi 70
  out7sdi 80
  out7sdi 90
  ret

#addr 0x5FC3
f1: 
  out7sdi 4
  out7sdi 6
  call f3
  out7sdi 32
  out7sdi 34
  out7sdi 36

  ret

#addr 0x1345
f3:
  out7sdi 9
  out7sdi 12
  out7sdi 15
  call f4
  out7sdi 30
  ret

#addr 0x6007
f4:
  out7sdi 19
  out7sdi 23
  out7sdi 27

  ret
