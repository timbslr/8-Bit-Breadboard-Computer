#include "./rules.asm"

add A
addi A, 1
addc A
sub A
subc A
and A
andi A, 1
or A
ori A, 1
xor A
xori A, 1
not A
neg A
shl A
slr A
sar A
ror A
rorn A, 0
rorn A, 1
rorn A, 2
rorn A, 3
rorn A, 4
rorn A, 5
rorn A, 6
rorn A, 7
rol A
roln A, 0
roln A, 1
roln A, 2
roln A, 3
roln A, 4
roln A, 5
roln A, 6
roln A, 7
bit 0b00110000
clr A
mov B, A
movf A
ld A, 8080
ldo A, 8080
st A, 8080
sto A, 8080
ldsp A
stsp A
li A, 1
push A
pop A
peek A
incx
incsp
incm 8080
decx
decsp 
decm 8080
out7sd A
outlcdc A
outlcdic 2
outlcdd A
outlcdid 2
nop
hlt
call 8080
ret
jmp 8080
beq 8080
beqi 2, 8080
bne 8080
bnei 2, 8080
blt 8080
blti 2, 8080
bltu 8080
bltiu 2, 8080
ble 8080
blei 2, 8080
bleu 8080
bleiu 2, 8080
bge 8080
bgei 2, 8080
bgeu 8080
bgeiu 2, 8080
bgt 8080
bgti 2, 8080
bgtu 8080
bgtiu 2, 8080
bns 8080
bnc 8080
bcs 8080
bcc 8080
bvs 8080
bvc 8080