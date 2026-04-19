	#include "rules.asm"
	
	call serial_clear
main:
    ; test vector 1
    li X, 0x22
    li Y, 0x22
    call test

    ; test vector 2
    li X, 0x22
    li Y, 0x11
    call test

    ; test vector 3
    li X, 0x10
    li Y, 0x20
    call test

    ; test vector 4
    li X, 0x30
    li Y, 0x10
    call test

    ; test vector 5
    li X, 0x80
    li Y, 0x01
    call test

    ; test vector 6
    li X, 0x01
    li Y, 0x80
    call test

    hlt
	hlt
	
	
test:
	mov A, X
	mov TMP, Y
	blt blttrue
	call f
	jmp skip1
blttrue:
	call t
skip1:
	mov A, X
	mov TMP, Y
	bltu bltutrue
	call f
	jmp skip2
bltutrue:
	call t
skip2:
	mov A, X
	mov TMP, Y
	ble bletrue
	call f
	jmp skip3
bletrue:
	call t
skip3:
	mov A, X
	mov TMP, Y
	bleu bleutrue
	call f
	jmp skip4
bleutrue:
	call t
skip4:
	mov A, X
	mov TMP, Y
	beq beqtrue
	call f
	jmp skip5
beqtrue:
	call t
skip5:
	mov A, X
	mov TMP, Y
	bne bnetrue
	call f
	jmp skip6
bnetrue:
	call t
skip6:
	mov A, X
	mov TMP, Y
	bge bgetrue
	call f
	jmp skip7
bgetrue:
	call t
skip7:
	mov A, X
	mov TMP, Y
	bgeu bgeutrue
	call f
	jmp skip8
bgeutrue:
	call t
skip8:
	mov A, X
	mov TMP, Y
	bgt bgttrue
	call f
	jmp skip9
bgttrue:
	call t
skip9:
	mov A, X
	mov TMP, Y
	bgtu bgtutrue
	call f
	jmp skip10
bgtutrue:
	call t
skip10:
	li B, "\r"
	call serial_print_char
	ret
	
f:
	li B, "f"
	call serial_print_char
	ret
t:
	li B, "t"
	call serial_print_char
	ret
	
	#include ".\\lib\\serial.asm"
