#include "./rules.asm"

li X, 10
st X, 0x8000
li X, 11
st X, 0x8001
li X, 12
st X, 0x8002
li X, 13
st X, 0x8003
li X, 14
st X, 0x8004
li X, 15
st X, 0x8005
li X, 16
st X, 0x8006
li X, 17
st X, 0x8007
li X, 18
st X, 0x8008
li X, 19
st X, 0x8009
li X, 20
st X, 0x8010
out7sdi 100
ld X, 0x8010
out7sd X
ld X, 0x8009
out7sd X
ld X, 0x8008
out7sd X
ld X, 0x8007
out7sd X
ld X, 0x8006
out7sd X
ld X, 0x8005
out7sd X
ld X, 0x8004
out7sd X
ld X, 0x8003
out7sd X
ld X, 0x8002
out7sd X
ld X, 0x8001
out7sd X
ld X, 0x8000
out7sd X

hlt
